import type { ClawdbotPluginApi } from "clawdfun/plugin-sdk";
import { createTokenGeneratorTool } from "./src/token-tool.js";
import { createDeployTool } from "./src/deploy-tool.js";

const plugin = {
  id: "clawdfun",
  name: "ClawdFun",
  description: "Meme token generator and deployer - creates and deploys crypto tokens to pump.fun",
  register(api: ClawdbotPluginApi) {
    api.registerTool(createTokenGeneratorTool(api), { optional: false });
    api.registerTool(createDeployTool(api), { optional: false });
  },
};

export default plugin;
