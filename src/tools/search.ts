import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { debug } from "../debug.js";
import { fetchApiResponse } from "../fetch.js";

export function registerTool(server: McpServer) {
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
    async (args) => {
      debug("RECEIVED QUERY:", args);
      const {
        q,
        name,
        name_equals,
        name_startsWith,
        country,
        countryBias,
        continentCode,
      } = args;

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
        username: process.env.GEONAMES_USERNAME!,
      });

      const searchUrl = `${
        process.env.GEONAMES_API_BASE
      }/searchJSON?${params.toString()}`;
      debug("CALLING API:", searchUrl);
      const searchData = await fetchApiResponse<Response>(searchUrl);
      debug("RECEIVED DATA:", searchData);

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
