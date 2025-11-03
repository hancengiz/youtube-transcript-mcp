# MCP Server Testing Guide

This document explains how to test the YouTube Transcript MCP Server to ensure compliance with all MCP-enabled systems, including Claude Code, Claude Desktop, and other MCP clients.

## Overview

MCP server testing should cover two main aspects:

1. **Compliance Testing** - Ensures your server adheres to MCP specifications and JSON Schema standards
2. **Functional Testing** - Verifies your tools work correctly with actual YouTube videos

## Testing Architecture

### Test Script Structure

The test suite (`test-server.js`) implements a multi-layered testing approach:

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import Ajv from "ajv";
import addFormats from "ajv-formats";
```

### Layer 1: Connection Testing

Verify the server can establish MCP protocol connections:

```javascript
const client = new Client({
  name: "test-client",
  version: "1.0.0",
}, {
  capabilities: {},
});

await client.connect(transport);
```

**What this tests:**
- Server starts correctly
- Stdio transport works
- MCP handshake succeeds

### Layer 2: Compliance Testing

Validates that tool schemas are compatible with Claude's API and MCP clients.

#### Required Schema Fields

Every tool `inputSchema` must include:

```javascript
{
  $schema: "https://json-schema.org/draft/2020-12/schema",  // REQUIRED for Claude API!
  type: "object",
  properties: { /* ... */ },
  required: [ /* ... */ ],
  additionalProperties: false  // Recommended for strict validation
}
```

**IMPORTANT:** Claude API now requires schemas **WITH** the `$schema` field set to draft 2020-12. Missing it will cause a 400 error.

### Layer 3: Functional Testing

Test actual transcript retrieval with real YouTube videos:

```javascript
const result = await client.callTool({
  name: "get-transcript",
  arguments: {
    url: "https://www.youtube.com/watch?v=VIDEO_ID",
    include_timestamps: true,
  },
});
```

## Running Tests

### Install Dependencies

```bash
npm install
```

### Run Test Suite

```bash
npm test
```

Or directly:

```bash
node test-server.js
```

### Expected Output

```
Starting YouTube Transcript MCP Server test...

✓ Connected to MCP server

Testing: List Tools
✓ Found 2 tools:
  - get-transcript: Retrieve the transcript of a YouTube video...
  - get-transcript-languages: List all available transcript languages...


=== COMPLIANCE TESTS ===

Validating schema compliance for: get-transcript
✓ Schema is valid for Claude API (using https://json-schema.org/draft/2020-12/schema)
✓ Schema compliance check PASSED for: get-transcript

Validating schema compliance for: get-transcript-languages
✓ Schema is valid for Claude API (using https://json-schema.org/draft/2020-12/schema)
✓ Schema compliance check PASSED for: get-transcript-languages

✓ All schemas passed compliance checks!

=== FUNCTIONAL TESTS ===
Test 1: Getting transcript from a YouTube video...
✓ Transcript retrieval successful

Test 2: Getting transcript without timestamps...
✓ Transcript (no timestamps) retrieval successful

All tests completed!
```

## Common Compliance Issues

### Issue 1: Missing or Wrong `$schema` Field

**Problem:**
```javascript
inputSchema: {
  // ❌ Missing $schema field
  type: "object",
  properties: { /* ... */ }
}
```

**Solution:**
```javascript
inputSchema: {
  $schema: "https://json-schema.org/draft/2020-12/schema",  // ✓ Required!
  type: "object",
  properties: { /* ... */ }
}
```

### Issue 2: Invalid URL Format

**Problem:**
- User provides invalid YouTube URL
- Video ID cannot be extracted

**Solution:**
- Use comprehensive URL parsing with multiple regex patterns
- Provide helpful error messages for invalid formats

## Best Practices

### 1. Always Validate Schemas

Run compliance tests before publishing:

```bash
npm test
```

### 2. Document Parameter Defaults

Document defaults in descriptions:

```javascript
{
  type: "boolean",
  description: "Include timestamps in output. Default: true"
}
```

### 3. Test Error Handling

Verify your server handles invalid inputs gracefully:

```javascript
try {
  await client.callTool({
    name: "get-transcript",
    arguments: { url: "https://invalid-url.com" }
  });
} catch (error) {
  // Should return helpful error message
  console.log(error.message);
}
```

## Compatibility Testing

### Test with Claude Code (CLI)

```bash
# Add to config
claude mcp add youtube-transcript npx @fabriqa.ai/youtube-transcript-mcp@latest

# Test in Claude Code
cc
> Get the transcript from https://www.youtube.com/watch?v=VIDEO_ID
```

### Test with Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "npx",
      "args": ["@fabriqa.ai/youtube-transcript-mcp@latest"]
    }
  }
}
```

Restart Claude Desktop and test.

## Debugging Common Issues

### Server Won't Start

**Check:**
- Is `#!/usr/bin/env node` at the top of index.js?
- Is the file executable? `chmod +x index.js`
- Are dependencies installed? `npm install`

### Tools Not Appearing

**Check:**
- Does `listTools()` return your tools?
- Are tool names unique?
- Is the server handler registered correctly?

### Transcript Not Found

**Check:**
- Does the video have captions/transcripts enabled?
- Is the video publicly accessible?
- Is there a network connection?
- Try accessing the video on YouTube directly

## Summary

A complete MCP server test suite should:

1. ✓ Test MCP protocol connection
2. ✓ Validate schema compliance (MUST include `$schema` field)
3. ✓ Verify tool discovery
4. ✓ Test functional behavior with real YouTube videos
5. ✓ Handle errors gracefully
6. ✓ Work with multiple MCP clients

**Key Takeaways:**
- Claude API requires schemas **WITH** the `$schema: "https://json-schema.org/draft/2020-12/schema"` field
- Use `additionalProperties: false` for strict validation
- Document default values in `description` fields
- Test with actual YouTube videos to validate end-to-end functionality
