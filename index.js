#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { YoutubeTranscript } from "youtube-transcript";

// Get package.json path for version info
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(
  await fs.readFile(path.join(__dirname, "package.json"), "utf-8")
);
const VERSION = packageJson.version;

/**
 * MCP Server for YouTube Transcript Retrieval
 * Provides tools for fetching transcripts from YouTube videos
 */
class YouTubeTranscriptServer {
  constructor() {
    this.server = new Server(
      {
        name: "youtube-transcript-mcp-server",
        version: VERSION,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  setupErrorHandling() {
    this.server.onerror = (error) => {
      console.error("[MCP Error]", error);
    };

    process.on("SIGINT", async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get-transcript",
          description:
            "Retrieve the transcript of a YouTube video. Accepts various YouTube URL formats and returns the full transcript with timestamps.",
          inputSchema: {
            $schema: "https://json-schema.org/draft/2020-12/schema",
            type: "object",
            properties: {
              url: {
                type: "string",
                description:
                  "YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID or https://youtu.be/VIDEO_ID)",
              },
              lang: {
                type: "string",
                description:
                  "Language code for transcript (e.g., 'en', 'es', 'fr'). Default: video's default language",
              },
              include_timestamps: {
                type: "boolean",
                description:
                  "Include timestamps in the transcript output. Default: true",
              },
            },
            required: ["url"],
            additionalProperties: false,
          },
        },
        {
          name: "get-transcript-languages",
          description:
            "List all available transcript languages for a YouTube video.",
          inputSchema: {
            $schema: "https://json-schema.org/draft/2020-12/schema",
            type: "object",
            properties: {
              url: {
                type: "string",
                description: "YouTube video URL",
              },
            },
            required: ["url"],
            additionalProperties: false,
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case "get-transcript":
            return await this.handleGetTranscript(args);
          case "get-transcript-languages":
            return await this.handleGetLanguages(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Extract video ID from various YouTube URL formats
   */
  extractVideoId(url) {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
      /youtube\.com\/watch\?.*v=([^&\?\/]+)/,
      /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    throw new Error(
      "Invalid YouTube URL format. Please provide a valid YouTube video URL."
    );
  }

  /**
   * Format transcript with or without timestamps
   */
  formatTranscript(transcript, includeTimestamps = true) {
    if (includeTimestamps) {
      return transcript
        .map((entry) => {
          const timestamp = this.formatTime(entry.offset / 1000);
          return `[${timestamp}] ${entry.text}`;
        })
        .join("\n");
    } else {
      return transcript.map((entry) => entry.text).join(" ");
    }
  }

  /**
   * Format milliseconds to MM:SS or HH:MM:SS
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }

  async handleGetTranscript(args) {
    const { url, lang, include_timestamps = true } = args;

    const videoId = this.extractVideoId(url);

    // Fetch transcript
    const config = lang ? { lang } : undefined;
    const transcript = await YoutubeTranscript.fetchTranscript(
      videoId,
      config
    );

    if (!transcript || transcript.length === 0) {
      throw new Error("No transcript available for this video.");
    }

    const formattedTranscript = this.formatTranscript(
      transcript,
      include_timestamps
    );

    const result = [
      `YouTube Transcript for Video: ${videoId}`,
      `URL: https://www.youtube.com/watch?v=${videoId}`,
      lang ? `Language: ${lang}` : "",
      `\n${formattedTranscript}`,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      content: [
        {
          type: "text",
          text: result,
        },
      ],
    };
  }

  async handleGetLanguages(args) {
    const { url } = args;

    const videoId = this.extractVideoId(url);

    try {
      // Try to fetch transcript in default language to get available languages
      // Note: youtube-transcript doesn't have a direct method to list languages
      // We'll attempt to get the transcript and provide info about that
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);

      if (!transcript || transcript.length === 0) {
        throw new Error("No transcripts available for this video.");
      }

      const result = [
        `Video ID: ${videoId}`,
        `URL: https://www.youtube.com/watch?v=${videoId}`,
        `\nTranscript is available for this video.`,
        `\nTo get a transcript in a specific language, use the get-transcript tool with the 'lang' parameter.`,
        `Common language codes: 'en' (English), 'es' (Spanish), 'fr' (French), 'de' (German), 'ja' (Japanese), etc.`,
      ].join("\n");

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    } catch (error) {
      throw new Error(
        `Could not fetch transcript information: ${error.message}`
      );
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(
      `YouTube Transcript MCP Server v${VERSION} running on stdio`
    );
  }
}

// Start the server
const server = new YouTubeTranscriptServer();
server.start().catch(console.error);
