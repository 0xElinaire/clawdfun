import type { ClawdbotPluginApi } from "clawdfun/plugin-sdk";
import { createTokenGeneratorTool } from "./src/token-tool.js";

const plugin = {
  id: "clawdfun",
  name: "ClawdFun",
  description: "Meme token concept generator - creates unique crypto token ideas with names, tickers, narratives, and tokenomics",
  register(api: ClawdbotPluginApi) {
    api.registerTool(createTokenGeneratorTool(api), { optional: false });
  },
};

export default plugin;
