import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { registerTool as registerSearchTool } from "./tools/search.js";
import { registerTool as registerGetTool } from "./tools/get.js";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve path to .env file (going up one directory from src)
const envPath = path.resolve(__dirname, '..', '.env');
dotenv.config({ path: envPath });

if (!process.env.GEONAMES_USERNAME) {
  throw new Error("Environment variable GEONAMES_USERNAME is not set.");
}

const server = new McpServer({
  name: "geonames",  
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

registerSearchTool(server);
registerGetTool(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Geonames MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
