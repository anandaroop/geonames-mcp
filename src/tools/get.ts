import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { debug } from "../debug.js";
import { fetchApiResponse } from "../fetch.js";

export function registerTool(server: McpServer) {
  server.tool(
    "get-geoname",

    "Find a geoname entry by its geoname ID.\n" +
      "\n" +
      "The result will contain infomration such as bounding box, \n" +
      "alternate names, adminstrative subdivision hierarchy, \n" +
      "timezone, as well as crosslinks to sites such as Wikipedia.\n",

    {
      geonameId: z.number().describe("The geoname id to search for"),
    },

    async (args) => {
      debug("RECEIVED QUERY:", args);
      const { geonameId } = args;

      // Construct query parameters
      const params = new URLSearchParams({
        geonameId: geonameId.toString(),
        username: process.env.GEONAMES_USERNAME!,
      });

      const url = `${process.env.GEONAMES_API_BASE}/get?${params.toString()}`;
      debug("CALLING API:", url);
      const data = await fetchApiResponse<Response>(url);
      debug("RECEIVED DATA:", data);

      const jsonResponse = {
        query: {
          geonameId,
        },
        result: data,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(jsonResponse, null, 2),
          },
        ],
      };
    }
  );
}
