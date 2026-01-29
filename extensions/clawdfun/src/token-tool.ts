import { Type } from "@sinclair/typebox";
import type { ClawdbotPluginApi } from "clawdfun/plugin-sdk";

export interface TokenConcept {
  name: string;
  ticker: string;
  tagline: string;
  narrative: string;
  features: string[];
  targetAudience: string;
  tokenomics: {
    totalSupply: number;
    distribution: {
      community: number;
      dev: number;
      liquidity: number;
    };
  };
  logoPrompt: string;
  style: "meme" | "professional" | "artistic";
}

export function createTokenGeneratorTool(api: ClawdbotPluginApi) {
  return {
    name: "generate_token_concept",
    description: `Generate a unique meme token concept. Use this when the user wants to create a token, coin, or crypto concept. Returns a complete token package with name, ticker, story, tokenomics, and logo prompt.`,
    parameters: Type.Object({
      idea: Type.String({
        description: "The theme or idea for the token (e.g. 'space cats', 'pizza lovers', 'monday haters')"
      }),
      style: Type.Optional(
        Type.Union([
          Type.Literal("meme"),
          Type.Literal("professional"),
          Type.Literal("artistic"),
        ], {
          description: "Token style: meme (fun viral), professional (serious DeFi), artistic (creative NFT-style). Default: meme"
        })
      ),
    }),

    async execute(_id: string, params: Record<string, unknown>) {
      const idea = String(params.idea || "random meme");
      const style = (params.style as string) || "meme";

      // Generate a token concept based on the idea
      const concept = generateTokenConcept(idea, style);

      const response = formatTokenResponse(concept);

      return {
        content: [{ type: "text", text: response }],
        details: { concept },
      };
    },
  };
}

function generateTokenConcept(idea: string, style: string): TokenConcept {
  // Generate creative name based on idea
  const words = idea.toLowerCase().split(/\s+/);
  const baseWord = words[0] || "meme";

  // Creative name generation
  const nameSuffixes = ["Coin", "Token", "Inu", "Moon", "Rocket", "DAO", "Fi"];
  const suffix = nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)];
  const name = capitalize(baseWord) + suffix;

  // Ticker generation (3-5 chars)
  const ticker = generateTicker(baseWord);

  // Tagline
  const taglines = [
    `To the moon with ${idea}!`,
    `The future of ${idea} is here`,
    `${capitalize(idea)} meets blockchain`,
    `Powered by ${idea}, fueled by community`,
    `Where ${idea} becomes wealth`,
  ];
  const tagline = taglines[Math.floor(Math.random() * taglines.length)];

  // Narrative
  const narrative = generateNarrative(idea, name, style);

  // Features
  const features = generateFeatures(idea, style);

  // Target audience
  const audiences = [
    `${capitalize(idea)} enthusiasts and crypto degens`,
    `Meme lovers who believe in ${idea}`,
    `Early adopters looking for the next 100x`,
    `Community builders passionate about ${idea}`,
  ];
  const targetAudience = audiences[Math.floor(Math.random() * audiences.length)];

  // Tokenomics
  const tokenomics = {
    totalSupply: 1_000_000_000,
    distribution: {
      community: 70,
      dev: 10,
      liquidity: 20,
    },
  };

  // Logo prompt
  const logoPrompt = `Crypto token logo featuring ${idea}. ${style === "meme" ? "Fun, cartoonish style with bold colors" : style === "professional" ? "Clean, minimalist design with gradient" : "Artistic, unique design with creative elements"}. Circular logo, suitable for token icon.`;

  return {
    name,
    ticker,
    tagline,
    narrative,
    features,
    targetAudience,
    tokenomics,
    logoPrompt,
    style: style as "meme" | "professional" | "artistic",
  };
}

function generateTicker(word: string): string {
  const clean = word.replace(/[^a-z]/gi, "").toUpperCase();
  if (clean.length <= 5) return clean || "MEME";
  return clean.slice(0, 4);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateNarrative(idea: string, name: string, style: string): string {
  if (style === "meme") {
    return `${name} was born from the depths of crypto Twitter, where legends are made and paper hands are shaken out.

What started as a joke about ${idea} has evolved into a movement. The community decided that ${idea} deserves its own token, and here we are.

Join the ${name} army. We're not just going to the moon - we're building a colony there. Diamond hands only. 💎🙌`;
  } else if (style === "professional") {
    return `${name} represents a new paradigm in decentralized finance, combining the viral potential of meme culture with robust tokenomics.

Built on the concept of ${idea}, our protocol aims to create sustainable value through community governance and innovative yield mechanisms.

With a focus on transparency and long-term growth, ${name} is positioned to become a cornerstone of the next generation of DeFi applications.`;
  } else {
    return `${name} is more than a token - it's a digital art movement inspired by ${idea}.

Each holder becomes part of an exclusive collective, where creativity meets blockchain technology. The boundaries between meme and masterpiece blur.

Welcome to the ${name} gallery. Your wallet is your membership card.`;
  }
}

function generateFeatures(idea: string, style: string): string[] {
  const baseFeatures = [
    `Community-driven governance`,
    `Deflationary tokenomics with 2% burn`,
    `Staking rewards for diamond hands`,
  ];

  if (style === "meme") {
    return [
      ...baseFeatures,
      `Meme contests with token prizes`,
      `Anti-whale mechanics`,
    ];
  } else if (style === "professional") {
    return [
      ...baseFeatures,
      `Multi-sig treasury`,
      `Audited smart contracts`,
    ];
  } else {
    return [
      ...baseFeatures,
      `NFT collection for top holders`,
      `Artist collaboration program`,
    ];
  }
}

function formatTokenResponse(concept: TokenConcept): string {
  return `🎉 **${concept.name}** ($${concept.ticker})

📌 ${concept.tagline}

📖 **Story:**
${concept.narrative}

✨ **Features:**
${concept.features.map(f => `• ${f}`).join("\n")}

📊 **Tokenomics:**
• Supply: ${concept.tokenomics.totalSupply.toLocaleString()}
• Community: ${concept.tokenomics.distribution.community}%
• Dev: ${concept.tokenomics.distribution.dev}%
• Liquidity: ${concept.tokenomics.distribution.liquidity}%

🎯 **Target:** ${concept.targetAudience}

🎨 **Logo idea:** ${concept.logoPrompt}`;
}
