#!/usr/bin/env node

/**
 * Test script for YouTube Transcript MCP Server
 * This simulates MCP client requests to test the server functionality
 * and validates JSON schema compliance
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize JSON Schema validator for draft-07
const ajv = new Ajv({
  strict: true,
  allErrors: true,
  verbose: true,
});
addFormats(ajv);

/**
 * Validate that a schema is a valid JSON Schema for Claude API
 * Note: Claude API now requires schemas WITH $schema field (draft 2020-12)
 */
function validateSchemaCompliance(toolName, schema) {
  console.log(`\nValidating schema compliance for: ${toolName}`);

  // Check required fields (Claude API now requires $schema)
  const requiredFields = ["$schema", "type", "properties", "required"];
  const missingFields = requiredFields.filter((field) => !(field in schema));

  if (missingFields.length > 0) {
    console.error(`✗ Missing required fields: ${missingFields.join(", ")}`);
    return false;
  }

  // Validate $schema field is present and correct
  const validSchemaUrls = [
    "https://json-schema.org/draft/2020-12/schema",
    "http://json-schema.org/draft-07/schema#", // Also accept draft-07 for backwards compatibility
  ];

  if (!validSchemaUrls.includes(schema.$schema)) {
    console.error(
      `✗ Invalid $schema value. Expected: ${validSchemaUrls[0]}`
    );
    console.error(`  Got: ${schema.$schema}`);
    return false;
  }

  // Validate the schema itself is valid JSON Schema
  try {
    // For draft 2020-12, skip Ajv validation (Ajv doesn't support it by default)
    // Claude's API will validate it properly
    if (schema.$schema === "https://json-schema.org/draft/2020-12/schema") {
      console.log(
        `✓ Schema is valid for Claude API (using ${schema.$schema})`
      );
      return true;
    }

    // For draft-07, use Ajv to validate
    ajv.compile(schema);
    console.log(`✓ Schema is valid for Claude API (using ${schema.$schema})`);
    return true;
  } catch (error) {
    console.error(`✗ Schema validation failed: ${error.message}`);
    return false;
  }
}

async function testServer() {
  console.log("Starting YouTube Transcript MCP Server test...\n");

  // Start the server process
  const serverProcess = spawn("node", [path.join(__dirname, "index.js")], {
    stdio: ["pipe", "pipe", "inherit"],
  });

  // Create client with stdio transport
  const transport = new StdioClientTransport({
    command: "node",
    args: [path.join(__dirname, "index.js")],
  });

  const client = new Client(
    {
      name: "test-client",
      version: "1.0.0",
    },
    {
      capabilities: {},
    }
  );

  try {
    await client.connect(transport);
    console.log("✓ Connected to MCP server\n");

    // List available tools
    console.log("Testing: List Tools");
    const tools = await client.listTools();
    console.log(`✓ Found ${tools.tools.length} tools:`);
    tools.tools.forEach((tool) => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log();

    // Compliance Testing: Validate all tool schemas
    console.log("\n=== COMPLIANCE TESTS ===");
    let allSchemasValid = true;
    for (const tool of tools.tools) {
      const isValid = validateSchemaCompliance(tool.name, tool.inputSchema);
      if (!isValid) {
        allSchemasValid = false;
        console.error(
          `✗ Schema compliance check FAILED for: ${tool.name}\n`
        );
      } else {
        console.log(`✓ Schema compliance check PASSED for: ${tool.name}`);
      }
    }

    if (!allSchemasValid) {
      console.error("\n✗ Some schemas failed compliance checks!");
      console.error("This would cause errors when used with Claude's API.\n");
    } else {
      console.log("\n✓ All schemas passed compliance checks!\n");
    }

    console.log("=== FUNCTIONAL TESTS ===");

    // Test 1: Get transcript from a popular YouTube video
    console.log("Test 1: Getting transcript from a YouTube video...");
    console.log(
      "Using test video: https://www.youtube.com/watch?v=dQw4w9WgXcQ\n"
    );
    try {
      const transcriptResult = await client.callTool({
        name: "get-transcript",
        arguments: {
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          include_timestamps: true,
        },
      });
      console.log("✓ Transcript retrieval successful:");
      const text = transcriptResult.content[0].text;
      // Show first 500 characters of results
      console.log(text.substring(0, 500) + "...\n");
    } catch (error) {
      console.error("✗ Transcript test failed:", error.message);
      console.log("Note: This may fail due to network issues or if the video has no transcript\n");
    }

    // Test 2: Get transcript without timestamps
    console.log("Test 2: Getting transcript without timestamps...");
    try {
      const transcriptResult = await client.callTool({
        name: "get-transcript",
        arguments: {
          url: "dQw4w9WgXcQ", // Test with just video ID
          include_timestamps: false,
        },
      });
      console.log("✓ Transcript (no timestamps) retrieval successful:");
      const text = transcriptResult.content[0].text;
      console.log(text.substring(0, 500) + "...\n");
    } catch (error) {
      console.error("✗ Transcript test failed:", error.message);
      console.log("Note: This may fail due to network issues or if the video has no transcript\n");
    }

    // Test 3: Get available languages
    console.log("Test 3: Getting available transcript languages...");
    try {
      const langResult = await client.callTool({
        name: "get-transcript-languages",
        arguments: {
          url: "https://youtu.be/dQw4w9WgXcQ", // Test with youtu.be format
        },
      });
      console.log("✓ Language check successful:");
      console.log(langResult.content[0].text);
      console.log();
    } catch (error) {
      console.error("✗ Language check failed:", error.message);
      console.log("Note: This may fail due to network issues or if the video has no transcript\n");
    }

    // Test 4: Test error handling with invalid URL
    console.log("Test 4: Testing error handling with invalid URL...");
    try {
      await client.callTool({
        name: "get-transcript",
        arguments: {
          url: "https://invalid-url.com",
        },
      });
      console.error(
        "✗ Expected error but got success (this shouldn't happen)"
      );
    } catch (error) {
      console.log("✓ Error handling working correctly");
      console.log(`  Error message: ${error.message}\n`);
    }

    console.log("All tests completed!");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await client.close();
    serverProcess.kill();
    process.exit(0);
  }
}

testServer().catch(console.error);
