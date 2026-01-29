# ClawdFun 🚀

AI-powered meme token concept generator for Telegram. Create unique crypto token ideas with names, tickers, narratives, and tokenomics.

## Features

- Generate creative token concepts with AI
- Catchy names and tickers
- Compelling narratives and stories
- Tokenomics breakdown
- Logo prompt ideas
- Natural conversational interface (no commands needed)

## Requirements

- Node.js 22.12.0+
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))
- Anthropic API access (Claude) or OpenAI API

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/clawdfun.git
cd clawdfun

# Install dependencies
npm install

# Create global command (optional)
npm link
```

## Quick Start

```bash
# Run setup
clawdfun setup

# Run interactive onboarding
clawdfun onboard
```

Or without global install:

```bash
node dist/entry.js setup
node dist/entry.js onboard
```

## Manual Setup

```bash
# 1. Enable plugins
clawdfun plugins enable telegram
clawdfun plugins enable clawdfun

# 2. Set Telegram bot token
clawdfun config set channels.telegram.botToken "YOUR_BOT_TOKEN"

# 3. Set gateway mode
clawdfun config set gateway.mode local

# 4. Start the bot
clawdfun gateway
```

## Usage

Just chat with your bot naturally! Ask it to create token concepts:

- "Create a token about space cats"
- "I want a meme coin for pizza lovers"
- "Generate a professional DeFi token concept"

The bot will use AI to generate complete token packages including name, ticker, story, tokenomics, and logo ideas.

## Configuration

Config file: `~/.clawdfun/clawdfun.json`

Agent personality files in workspace (`~/clawd/` by default):
- `IDENTITY.md` - Bot identity
- `SOUL.md` - Bot personality and behavior

## Commands

```bash
clawdfun setup          # Initial setup
clawdfun onboard        # Interactive configuration
clawdfun gateway        # Start the bot
clawdfun plugins list   # List plugins
clawdfun channels status # Check channel status
clawdfun tui            # Terminal UI
```

## License

MIT
