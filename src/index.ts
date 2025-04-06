import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";
dotenv.config();

// http get "http://api.geonames.org/searchJSON?q=london&maxRows=10&username=GEONAMES_USERNAME"
const API_BASE = "http://api.geonames.org";
const USER_AGENT = "geonames-app/1.0";

const GEONAMES_USERNAME = process.env.GEONAMES_USERNAME;
if (!GEONAMES_USERNAME) {
  throw new Error("Environment variable GEONAMES_USERNAME is not set.");
}

// Create server instance
const server = new McpServer({
  name: "geonames",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

// Helper function for making API requests
async function makeAPIRequest<T>(url: string): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/json",
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making API request:", error);
    return null;
  }
}

export interface Response {
  totalResultsCount: number;
  geonames: Geoname[];
}

export interface Geoname {
  adminCode1: string;
  adminCodes1: AdminCodes1;
  adminName1: string;
  countryCode: string;
  countryId: string;
  countryName: string;
  fcl: string;
  fclName: string;
  fcode: string;
  fcodeName: string;
  geonameId: number;
  lat: string;
  lng: string;
  name: string;
  population: number;
  toponymName: string;
}

export interface AdminCodes1 {
  ISO3166_2: string;
}

// Register tools

server.tool(
  "search-geonames",
  "Search for geographic places by query term",
  {
    q: z
      .string()
      .optional()
      .describe("Search places where any field contains query term"),
    name: z
      .string()
      .optional()
      .describe("Search places where name contains query term"),
    name_equals: z
      .string()
      .optional()
      .describe("Search places where name exactly matches query term"),
    name_startsWith: z
      .string()
      .optional()
      .describe("Search places where name starts with query term"),
    country: z
      .string()
      .optional()
      .describe("Filter results by country code (e.g., 'US')"),
    countryBias: z
      .string()
      .optional()
      .describe("Bias results towards a specific country code (e.g., 'US')"),
    continentCode: z
      .string()
      .optional()
      .describe("Filter results by continent code (e.g., 'EU')"),
  },
  async ({
    q,
    name,
    name_equals,
    name_startsWith,
    country,
    countryBias,
    continentCode,
  }) => {
    console.error("################## RECEIVED QUERY:", {
      q,
      name,
      name_equals,
      name_startsWith,
      country,
      countryBias,
      continentCode,
    });

    // Construct query parameters
    const params = new URLSearchParams({
      ...(q && { q: encodeURIComponent(q) }),
      ...(name && { name: encodeURIComponent(name) }),
      ...(name_equals && { name_equals: encodeURIComponent(name_equals) }),
      ...(name_startsWith && {
        name_startsWith: encodeURIComponent(name_startsWith),
      }),
      ...(country && { country: encodeURIComponent(country) }),
      ...(countryBias && { countryBias: encodeURIComponent(countryBias) }),
      ...(continentCode && {
        continentCode: encodeURIComponent(continentCode),
      }),
      maxRows: "10",
      username: GEONAMES_USERNAME,
    });

    const searchUrl = `${API_BASE}/searchJSON?${params.toString()}`;
    console.error("################## CALLING API:", searchUrl);
    const searchData = await makeAPIRequest<Response>(searchUrl);
    console.error("################## RECEIVED DATA:", searchData);

    // Format response as JSON structure
    const jsonResponse = {
      query: {
        q,
        name,
        name_equals,
        name_startsWith,
        country,
        countryBias,
        continentCode,
      },
      totalResults: searchData?.totalResultsCount || 0,
      results:
        searchData?.geonames.map((geoname) => ({
          name: geoname.name,
          population: geoname.population,
          coordinates: {
            latitude: geoname.lat,
            longitude: geoname.lng,
          },
          country: {
            name: geoname.countryName,
            code: geoname.countryCode,
            id: geoname.countryId,
          },
          admin1: {
            name: geoname.adminName1,
            code: geoname.adminCode1,
          },
          feature: {
            class: geoname.fcl,
            className: geoname.fclName,
            code: geoname.fcode,
            codeName: geoname.fcodeName,
          },
          geonameId: geoname.geonameId,
          toponymName: geoname.toponymName,
        })) || [],
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Geonames MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
