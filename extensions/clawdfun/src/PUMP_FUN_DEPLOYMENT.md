# Pump.Fun Token Deployment - Technical Reference

## Overview
This document describes how to deploy a meme token to pump.fun on Solana mainnet.

## Required Dependencies
- `@solana/web3.js` - Solana SDK
- `bs58` - Base58 encoding/decoding
- HTTP client for API calls

## Constants (Program IDs)

```
PUMP_PROGRAM = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
ASSOCIATED_TOKEN_PROGRAM = "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
MPL_TOKEN_METADATA = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
SYSTEM_PROGRAM = "11111111111111111111111111111111"
RENT = "SysvarRent111111111111111111111111111111111"
EVENT_AUTHORITY = "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1"
```

## Deployment Steps

### Step 1: Load Wallet
Parse the private key (base58 string or JSON array) into a Keypair.

### Step 2: Generate New Mint Keypair
Create a new random Keypair for the token mint address.

### Step 3: Upload Metadata to IPFS
**Endpoint:** `POST https://pump.fun/api/ipfs`

**Form Data:**
- `name` - Token name
- `symbol` - Token ticker
- `description` - Token description
- `showName` - "true"
- `file` - Image file (PNG/JPG)

**Response:**
```json
{
  "metadataUri": "https://cf-ipfs.com/ipfs/..."
}
```

### Step 4: Derive PDA Addresses
All PDAs derived from seeds:

```
bonding_curve = PDA(["bonding-curve", mint_pubkey], PUMP_PROGRAM)
associated_bonding_curve = PDA([bonding_curve, TOKEN_PROGRAM, mint_pubkey], ASSOCIATED_TOKEN_PROGRAM)
global_state = PDA(["global"], PUMP_PROGRAM)
metadata_account = PDA(["metadata", MPL_TOKEN_METADATA, mint_pubkey], MPL_TOKEN_METADATA)
mint_authority = PDA(["mint-authority"], PUMP_PROGRAM)
```

### Step 5: Build Create Instruction

**Discriminator (8 bytes):** `[24, 30, 200, 40, 5, 28, 7, 119]`

**Instruction Data Format:**
```
[discriminator: 8 bytes] + [borsh_encoded_args] + [random_secret: 32 bytes]
```

**Args (Borsh encoded):**
- name: String (length-prefixed)
- symbol: String (length-prefixed)
- uri: String (length-prefixed) - the metadataUri from IPFS

**Secret bytes:** 32 random bytes (use crypto.getRandomValues or similar)

### Step 6: Account List (in exact order)

| # | Account | Signer | Writable |
|---|---------|--------|----------|
| 0 | mint (new keypair) | YES | YES |
| 1 | mint_authority (PDA) | NO | NO |
| 2 | bonding_curve (PDA) | NO | YES |
| 3 | associated_bonding_curve (PDA) | NO | YES |
| 4 | global_state (PDA) | NO | NO |
| 5 | MPL_TOKEN_METADATA | NO | NO |
| 6 | metadata_account (PDA) | NO | YES |
| 7 | signer (wallet) | YES | YES |
| 8 | SYSTEM_PROGRAM | NO | NO |
| 9 | TOKEN_PROGRAM | NO | NO |
| 10 | ASSOCIATED_TOKEN_PROGRAM | NO | NO |
| 11 | RENT | NO | NO |
| 12 | EVENT_AUTHORITY | NO | NO |
| 13 | PUMP_PROGRAM | NO | NO |

### Step 7: Add Compute Budget Instructions
Before the create instruction, add:
- `setComputeUnitPrice(100000)` - Priority fee
- `setComputeUnitLimit(250000)` - Compute limit

### Step 8: Build and Send Transaction
1. Get latest blockhash from RPC
2. Compile VersionedMessage with all 3 instructions
3. Sign with both signer keypair AND mint keypair
4. Send transaction with `confirmed` preflight commitment

### Step 9: Return Result
- Token address = mint keypair public key
- Transaction signature from RPC response
- Pump.fun URL = `https://pump.fun/{token_address}`

## Minimum Balance
Wallet needs at least **0.05 SOL** to cover transaction fees and rent.

## Error Handling
- Invalid private key format
- Insufficient SOL balance
- IPFS upload failure
- Transaction simulation failure
- Network errors

## Example Success Response
```
Token: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
Tx: https://solscan.io/tx/5VERv8NMvzbJMEkV8xnrLkEaWRtSz9CosKDYjCJjBRnbJLgp...
Pump.fun: https://pump.fun/7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

## Important Notes
1. The discriminator bytes MUST be exactly `[24, 30, 200, 40, 5, 28, 7, 119]`
2. Account order is critical - wrong order will fail
3. Both signer AND mint keypair must sign the transaction
4. The 32 random bytes at the end of instruction data are required
5. Use mainnet RPC: `https://api.mainnet-beta.solana.com`
