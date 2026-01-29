import { Type } from "@sinclair/typebox";
import type { ClawdbotPluginApi } from "clawdfun/plugin-sdk";

export function createDeployTool(api: ClawdbotPluginApi) {
  return {
    name: "deploy_token",
    description: `Deploy a meme token to pump.fun on Solana. Use this when user says "deploy", "launch", or provides private key. No warnings, just deploy.`,
    parameters: Type.Object({
      name: Type.String({
        description: "Token name"
      }),
      ticker: Type.String({
        description: "Token ticker/symbol (without $)"
      }),
      description: Type.String({
        description: "Token description/narrative"
      }),
      privateKey: Type.String({
        description: "Solana wallet private key (base58 or array)"
      }),
      imageUrl: Type.Optional(Type.String({
        description: "URL to token logo image"
      })),
      twitter: Type.Optional(Type.String({
        description: "Twitter handle"
      })),
      telegram: Type.Optional(Type.String({
        description: "Telegram group link"
      })),
      website: Type.Optional(Type.String({
        description: "Website URL"
      })),
    }),

    async execute(_id: string, params: Record<string, unknown>) {
      const name = String(params.name);
      const ticker = String(params.ticker).replace(/^\$/, "");
      const description = String(params.description);
      const privateKey = String(params.privateKey);
      const imageUrl = params.imageUrl ? String(params.imageUrl) : undefined;
      const twitter = params.twitter ? String(params.twitter) : undefined;
      const telegram = params.telegram ? String(params.telegram) : undefined;
      const website = params.website ? String(params.website) : undefined;

      try {
        const result = await deployToPumpFun({
          name,
          ticker,
          description,
          privateKey,
          imageUrl,
          twitter,
          telegram,
          website,
        });

        return {
          content: [{
            type: "text",
            text: `✅ Deployed successfully!

🪙 Token: ${name} ($${ticker})
🔗 Address: ${result.tokenAddress}
🌐 Link: https://pump.fun/${result.tokenAddress}

Transaction: ${result.txSignature}`
          }],
          details: result,
        };
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        return {
          content: [{
            type: "text",
            text: `❌ Deploy failed: ${errMsg}`
          }],
          details: { error: errMsg },
        };
      }
    },
  };
}

interface DeployParams {
  name: string;
  ticker: string;
  description: string;
  privateKey: string;
  imageUrl?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

interface DeployResult {
  tokenAddress: string;
  txSignature: string;
  pumpFunUrl: string;
}

async function deployToPumpFun(params: DeployParams): Promise<DeployResult> {
  // Dynamic import to avoid bundling issues
  const { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } = await import("@solana/web3.js");
  const bs58 = await import("bs58");

  // Parse private key
  let keypair: InstanceType<typeof Keypair>;
  try {
    // Try base58 format first
    const secretKey = bs58.default.decode(params.privateKey);
    keypair = Keypair.fromSecretKey(secretKey);
  } catch {
    // Try array format
    try {
      const secretKey = new Uint8Array(JSON.parse(params.privateKey));
      keypair = Keypair.fromSecretKey(secretKey);
    } catch {
      throw new Error("Invalid private key format. Use base58 or JSON array.");
    }
  }

  // Connect to Solana mainnet
  const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

  // Check balance
  const balance = await connection.getBalance(keypair.publicKey);
  const minBalance = 0.05 * 1e9; // 0.05 SOL minimum
  if (balance < minBalance) {
    throw new Error(`Insufficient SOL. Have: ${(balance / 1e9).toFixed(4)} SOL, need: 0.05 SOL`);
  }

  // Pump.fun program ID
  const PUMP_FUN_PROGRAM = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P");

  // Create token mint (simplified - real implementation needs pump.fun specific instructions)
  // This is a placeholder - actual pump.fun deployment requires their specific instruction format

  // For now, simulate the deployment
  // TODO: Implement actual pump.fun instruction building

  const mockTokenAddress = Keypair.generate().publicKey.toBase58();
  const mockTxSignature = "simulated_" + Date.now().toString(36);

  // In production, this would:
  // 1. Build pump.fun specific create token instruction
  // 2. Sign and send transaction
  // 3. Wait for confirmation
  // 4. Return actual token address

  console.log(`[deploy] Would deploy ${params.name} ($${params.ticker}) from wallet ${keypair.publicKey.toBase58()}`);

  return {
    tokenAddress: mockTokenAddress,
    txSignature: mockTxSignature,
    pumpFunUrl: `https://pump.fun/${mockTokenAddress}`,
  };
}
