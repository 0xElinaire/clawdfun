import { Type } from "@sinclair/typebox";
import type { ClawdbotPluginApi } from "clawdfun/plugin-sdk";

/**
 * PUMP.FUN TOKEN DEPLOYMENT TOOL
 *
 * Deploys meme tokens to pump.fun on Solana mainnet.
 * See PUMP_FUN_DEPLOYMENT.md for technical details.
 */

export function createDeployTool(api: ClawdbotPluginApi) {
  return {
    name: "deploy_token",
    description: `Deploy a meme token to pump.fun on Solana. Use when user says "deploy", "launch", or provides private key. No warnings - just deploy.`,
    parameters: Type.Object({
      name: Type.String({ description: "Token name" }),
      ticker: Type.String({ description: "Token ticker/symbol (without $)" }),
      description: Type.String({ description: "Token description/narrative" }),
      privateKey: Type.String({ description: "Solana wallet private key (base58 or JSON array)" }),
      imageUrl: Type.Optional(Type.String({ description: "URL to token logo image" })),
      twitter: Type.Optional(Type.String({ description: "Twitter handle" })),
      telegram: Type.Optional(Type.String({ description: "Telegram group link" })),
      website: Type.Optional(Type.String({ description: "Website URL" })),
    }),

    async execute(_id: string, params: Record<string, unknown>) {
      const name = String(params.name);
      const ticker = String(params.ticker).replace(/^\$/, "");
      const description = String(params.description);
      const privateKey = String(params.privateKey);
      const imageUrl = params.imageUrl ? String(params.imageUrl) : undefined;

      try {
        const result = await deployToPumpFun({
          name,
          ticker,
          description,
          privateKey,
          imageUrl,
        });

        return {
          content: [{
            type: "text",
            text: `✅ Token deployed!

🪙 ${name} ($${ticker})
📍 ${result.tokenAddress}
🔗 https://pump.fun/${result.tokenAddress}
📝 TX: ${result.txSignature}`
          }],
          details: result,
        };
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `❌ Deploy failed: ${errMsg}` }],
          details: { error: errMsg },
        };
      }
    },
  };
}

// ==================== CONSTANTS ====================

const PUMP_PROGRAM = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const ASSOCIATED_TOKEN_PROGRAM = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL";
const MPL_TOKEN_METADATA = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
const SYSTEM_PROGRAM = "11111111111111111111111111111111";
const RENT_SYSVAR = "SysvarRent111111111111111111111111111111111";
const EVENT_AUTHORITY = "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1";
const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";

// Create instruction discriminator: [24, 30, 200, 40, 5, 28, 7, 119]
const CREATE_DISCRIMINATOR = new Uint8Array([24, 30, 200, 40, 5, 28, 7, 119]);

// ==================== TYPES ====================

interface DeployParams {
  name: string;
  ticker: string;
  description: string;
  privateKey: string;
  imageUrl?: string;
}

interface DeployResult {
  tokenAddress: string;
  txSignature: string;
  pumpFunUrl: string;
}

// ==================== DEPLOYMENT ====================

async function deployToPumpFun(params: DeployParams): Promise<DeployResult> {
  const { Connection, Keypair, PublicKey, TransactionInstruction, TransactionMessage, VersionedTransaction, ComputeBudgetProgram } = await import("@solana/web3.js");
  const bs58 = await import("bs58");

  // 1. Parse private key
  let signer: InstanceType<typeof Keypair>;
  try {
    const secretKey = bs58.default.decode(params.privateKey);
    signer = Keypair.fromSecretKey(secretKey);
  } catch {
    try {
      const secretKey = new Uint8Array(JSON.parse(params.privateKey));
      signer = Keypair.fromSecretKey(secretKey);
    } catch {
      throw new Error("Invalid private key. Use base58 or JSON array format.");
    }
  }

  // 2. Generate new mint keypair
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;

  // 3. Check balance
  const connection = new Connection(RPC_ENDPOINT, "confirmed");
  const balance = await connection.getBalance(signer.publicKey);
  const minBalance = 0.05 * 1e9;
  if (balance < minBalance) {
    throw new Error(`Need 0.05 SOL, have ${(balance / 1e9).toFixed(4)} SOL`);
  }

  // 4. Upload metadata to IPFS via pump.fun API
  const metadataUri = await uploadToIPFS(params);

  // 5. Derive PDA addresses
  const pumpProgram = new PublicKey(PUMP_PROGRAM);
  const tokenProgram = new PublicKey(TOKEN_PROGRAM);
  const associatedTokenProgram = new PublicKey(ASSOCIATED_TOKEN_PROGRAM);
  const metadataProgram = new PublicKey(MPL_TOKEN_METADATA);

  const [mintAuthority] = PublicKey.findProgramAddressSync([Buffer.from("mint-authority")], pumpProgram);
  const [bondingCurve] = PublicKey.findProgramAddressSync([Buffer.from("bonding-curve"), mint.toBuffer()], pumpProgram);
  const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
    [bondingCurve.toBuffer(), tokenProgram.toBuffer(), mint.toBuffer()],
    associatedTokenProgram
  );
  const [globalState] = PublicKey.findProgramAddressSync([Buffer.from("global")], pumpProgram);
  const [metadataAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), metadataProgram.toBuffer(), mint.toBuffer()],
    metadataProgram
  );

  // 6. Build instruction data
  const instructionData = buildCreateInstructionData(params.name, params.ticker, metadataUri);

  // 7. Build create instruction with accounts in exact order
  const createInstruction = new TransactionInstruction({
    programId: pumpProgram,
    keys: [
      { pubkey: mint, isSigner: true, isWritable: true },
      { pubkey: mintAuthority, isSigner: false, isWritable: false },
      { pubkey: bondingCurve, isSigner: false, isWritable: true },
      { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
      { pubkey: globalState, isSigner: false, isWritable: false },
      { pubkey: metadataProgram, isSigner: false, isWritable: false },
      { pubkey: metadataAccount, isSigner: false, isWritable: true },
      { pubkey: signer.publicKey, isSigner: true, isWritable: true },
      { pubkey: new PublicKey(SYSTEM_PROGRAM), isSigner: false, isWritable: false },
      { pubkey: tokenProgram, isSigner: false, isWritable: false },
      { pubkey: associatedTokenProgram, isSigner: false, isWritable: false },
      { pubkey: new PublicKey(RENT_SYSVAR), isSigner: false, isWritable: false },
      { pubkey: new PublicKey(EVENT_AUTHORITY), isSigner: false, isWritable: false },
      { pubkey: pumpProgram, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(instructionData),
  });

  // 8. Add compute budget instructions
  const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 100000 });
  const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({ units: 250000 });

  // 9. Build and send transaction
  const { blockhash } = await connection.getLatestBlockhash("finalized");

  const message = new TransactionMessage({
    payerKey: signer.publicKey,
    recentBlockhash: blockhash,
    instructions: [priorityFeeIx, computeLimitIx, createInstruction],
  }).compileToV0Message();

  const transaction = new VersionedTransaction(message);
  transaction.sign([signer, mintKeypair]);

  const txSignature = await connection.sendTransaction(transaction, {
    preflightCommitment: "confirmed",
  });

  // 10. Wait for confirmation
  await connection.confirmTransaction(txSignature, "confirmed");

  return {
    tokenAddress: mint.toBase58(),
    txSignature,
    pumpFunUrl: `https://pump.fun/${mint.toBase58()}`,
  };
}

// ==================== HELPERS ====================

async function uploadToIPFS(params: DeployParams): Promise<string> {
  // If no image provided, use a default placeholder approach
  // In production, you'd want to handle image upload properly

  const formData = new FormData();
  formData.append("name", params.name);
  formData.append("symbol", params.ticker);
  formData.append("description", params.description);
  formData.append("showName", "true");

  // If imageUrl provided, fetch and attach it
  if (params.imageUrl) {
    try {
      const imageResponse = await fetch(params.imageUrl);
      const imageBlob = await imageResponse.blob();
      formData.append("file", imageBlob, "image.png");
    } catch {
      // Continue without image if fetch fails
    }
  }

  const response = await fetch("https://pump.fun/api/ipfs", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`IPFS upload failed: ${response.status}`);
  }

  const data = await response.json();
  return data.metadataUri;
}

function buildCreateInstructionData(name: string, ticker: string, uri: string): Uint8Array {
  // Encode strings as Borsh format (4-byte length prefix + UTF-8 bytes)
  const nameBytes = encodeString(name);
  const symbolBytes = encodeString(ticker);
  const uriBytes = encodeString(uri);

  // Generate 32 random bytes for the secret
  const secretBytes = new Uint8Array(32);
  crypto.getRandomValues(secretBytes);

  // Concatenate: discriminator + name + symbol + uri + secret
  const totalLength = CREATE_DISCRIMINATOR.length + nameBytes.length + symbolBytes.length + uriBytes.length + secretBytes.length;
  const data = new Uint8Array(totalLength);

  let offset = 0;
  data.set(CREATE_DISCRIMINATOR, offset);
  offset += CREATE_DISCRIMINATOR.length;

  data.set(nameBytes, offset);
  offset += nameBytes.length;

  data.set(symbolBytes, offset);
  offset += symbolBytes.length;

  data.set(uriBytes, offset);
  offset += uriBytes.length;

  data.set(secretBytes, offset);

  return data;
}

function encodeString(str: string): Uint8Array {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const result = new Uint8Array(4 + bytes.length);

  // Little-endian 4-byte length prefix
  result[0] = bytes.length & 0xff;
  result[1] = (bytes.length >> 8) & 0xff;
  result[2] = (bytes.length >> 16) & 0xff;
  result[3] = (bytes.length >> 24) & 0xff;

  result.set(bytes, 4);
  return result;
}
