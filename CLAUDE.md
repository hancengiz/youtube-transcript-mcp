# Claude Instructions for YouTube Transcript MCP Server

This document provides instructions for Claude (AI assistant) when working on this MCP server project.

## Project Overview

This is an MCP (Model Context Protocol) server that provides YouTube video transcript retrieval capabilities. It must remain compatible with Claude Code, Claude Desktop, and all MCP-enabled systems.

## Critical Rules

### 1. Always Run Tests After Changes

**MANDATORY**: After making ANY changes to the codebase, you MUST run the test suite:

```bash
npm test
# OR
node test-server.js
```

**This is not optional.** The test suite validates:
- JSON Schema compliance (required for Claude API compatibility)
- MCP protocol correctness
- Functional behavior of all tools with actual YouTube transcript retrieval

### 2. Schema Compliance Requirements

When modifying or adding tool schemas in `index.js`, ALL schemas MUST include:

```javascript
inputSchema: {
  $schema: "https://json-schema.org/draft/2020-12/schema",  // REQUIRED!
  type: "object",
  properties: {
    // ... your properties
  },
  required: ["list", "of", "required", "fields"],
  additionalProperties: false  // STRONGLY RECOMMENDED
}
```

**Common mistakes to avoid:**
- ❌ Missing `$schema` field → causes Claude API errors
- ❌ Using wrong schema version (must be draft 2020-12, not draft-07)
- ❌ Using `default` keyword → not validated, document in description instead
- ❌ Invalid property types (use "integer" not "int", "string" not "str")
- ❌ Missing `additionalProperties: false` → allows unexpected parameters

### 3. Testing Workflow

When making changes, follow this workflow:

1. **Make your changes** to `index.js` or other files
2. **Run tests immediately**: `npm test`
3. **Verify compliance tests pass**:
   ```
   ✓ Schema compliance check PASSED for: [tool-name]
   ```
4. **Verify functional tests pass** (or fail gracefully if network issues occur)
5. **Only proceed** if ALL compliance tests pass

### 4. If Tests Fail

If compliance tests fail:

```
✗ Schema compliance check FAILED for: get-transcript
```

**Do NOT ignore this.** Fix the schema before proceeding:

1. Check the error message for what's missing
2. Refer to `TESTING.md` for examples
3. Fix the schema
4. Run tests again
5. Repeat until all tests pass

### 5. Code Changes Guidelines

#### Adding a New Tool

```javascript
{
  name: "new-tool",
  description: "Clear description of what this tool does",
  inputSchema: {
    $schema: "https://json-schema.org/draft/2020-12/schema",  // Don't forget!
    type: "object",
    properties: {
      param1: {
        type: "string",
        description: "Description with defaults documented here. Default: 'value'"
      }
    },
    required: ["param1"],
    additionalProperties: false
  }
}
```

**After adding:** Run `npm test` immediately.

#### Modifying Existing Tools

1. Make your changes
2. Run `npm test`
3. If compliance fails, you broke something - fix it
4. Document what changed in your commit

#### URL Parsing Logic

When modifying URL parsing, ensure support for ALL these formats:

```javascript
// Must support:
"https://www.youtube.com/watch?v=VIDEO_ID"
"https://youtu.be/VIDEO_ID"
"https://m.youtube.com/watch?v=VIDEO_ID"
"VIDEO_ID"  // Direct 11-character ID
```

Test each format after changes.

### 6. Testing Edge Cases

When adding new functionality, test:

- ✓ Valid YouTube URLs work correctly
- ✓ Invalid URLs fail gracefully with helpful errors
- ✓ Missing transcripts are handled properly
- ✓ Various URL formats are supported
- ✓ Schema validates correctly with Ajv

### 7. Documentation Requirements

When changing functionality:

1. Update `README.md` if user-facing changes
2. Update `TESTING.md` if testing procedures change
3. Add examples for new features
4. Document breaking changes clearly
5. Update `LEARNING.md` with any new insights

### 8. Git Commit Guidelines

Use clear, descriptive commit messages:

```bash
git commit -m "Add feature: [description]

- Specific change 1
- Specific change 2
- Run tests: all passing"
```

**Before committing:** Run `npm test` one final time.

### 9. Git Push and npm Publishing Protocol

**CRITICAL WORKFLOW - NEVER SKIP:**

#### After Any Git Commit:

1. **ALWAYS ask user before pushing to git**: "Would you like me to push these changes to git?"
2. **If user approves push**: Execute `git push`
3. **IMMEDIATELY after successful push**: ALWAYS ask "Would you like me to publish this to npm?"

**This is MANDATORY. Never skip asking about npm publish after a git push.**

#### Publishing to npm

**Manual publish:**

```bash
# Bump version
npm version patch  # or minor/major

# Run tests
npm test

# Publish
npm publish

# Push to git
git push && git push --tags
```

**When to publish:**
- After fixing bugs (patch)
- After adding new features (minor)
- After breaking changes (major)
- After significant improvements
- When user requests it

## Development Workflow Checklist

Use this checklist for every change:

- [ ] Made code changes
- [ ] Ran `npm test`
- [ ] All compliance tests passed
- [ ] Functional tests behave as expected
- [ ] Updated documentation if needed
- [ ] Committed changes with clear message
- [ ] **ASKED USER** before pushing to git
- [ ] Pushed to remote repository (if user approved)
- [ ] **ASKED USER** if they want to publish to npm (MANDATORY after every push)

## Common Tasks

### Task: Fix a Schema Validation Error

```bash
# 1. Identify which tool failed
npm test  # Look for "✗ Schema compliance check FAILED"

# 2. Check the error message
# Common issues:
# - "Missing required fields: $schema" → Add $schema field
# - "Invalid $schema value" → Use draft 2020-12 URL
# - "Schema validation failed" → Check property types

# 3. Fix the schema in index.js

# 4. Test again
npm test

# 5. Verify it passes
# Look for: "✓ Schema compliance check PASSED"
```

### Task: Add a New Transcript Feature

```bash
# 1. Implement the feature in index.js
# 2. Add the tool definition with compliant schema
# 3. Add handler method
# 4. Test immediately
npm test

# 5. Add functional test in test-server.js
# 6. Test again
npm test

# 7. Update README.md with usage example
# 8. Commit
```

### Task: Debug Transcript Retrieval Issues

```bash
# 1. Run tests to identify the issue
npm test

# 2. Check error messages
# Common issues:
# - "No transcript available" → Video has no captions
# - "Invalid YouTube URL format" → URL parsing needs improvement
# - Network errors → May be transient

# 3. Fix the issue
# 4. Test again
npm test
```

## YouTube Transcript Specifics

### Video ID Extraction

Always support multiple URL formats:

```javascript
extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
    /youtube\.com\/watch\?.*v=([^&\?\/]+)/,
    /^([a-zA-Z0-9_-]{11})$/,  // Direct video ID
  ];
  // ... implementation
}
```

### Error Handling

Provide helpful error messages:

```javascript
// Good
throw new Error("No transcript available for this video. The video may not have captions enabled.");

// Bad
throw new Error("Error");
```

### Transcript Formatting

Support both formats:

```javascript
// With timestamps
[0:00] Introduction to the topic
[0:15] Main content begins

// Without timestamps (include_timestamps: false)
Introduction to the topic Main content begins
```

## Integration Testing

### Test with Claude Code

After changes pass `npm test`:

```bash
# 1. Ensure tests pass
npm test

# 2. Add to Claude Code (if not already added)
claude mcp add youtube-transcript npx @fabriqa.ai/youtube-transcript-mcp@latest

# 3. Start Claude Code
cc

# 4. Test the tool manually
> Get the transcript from https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### Test with Claude Desktop

1. Ensure `npm test` passes
2. Update `claude_desktop_config.json`
3. Restart Claude Desktop
4. Test tools manually with real YouTube URLs

## Reference Documentation

- **TESTING.md**: Comprehensive testing guide
- **LEARNING.md**: Learnings and best practices
- **README.md**: User-facing documentation
- **index.js**: Main server implementation
- **test-server.js**: Test suite implementation

## Error Messages to Watch For

### Claude API Errors

If you see this in Claude Code:
```
API Error: 400 tools.X.custom.input_schema: JSON schema is invalid
```

**This means:** Schema is not JSON Schema draft 2020-12 compliant
**Action:** Run `npm test` and fix failing schemas

### YouTube Transcript Errors

```
Error: No transcript available for this video
```

**This means:** Video doesn't have captions/transcripts
**Action:** This is expected behavior for some videos - ensure error message is helpful

### MCP Protocol Errors

```
Error: Server did not respond to initialize
```

**This means:** Server won't start or crashed
**Action:** Check server logs, verify `index.js` syntax

## Security Considerations

- Validate all YouTube URLs to prevent injection attacks
- Don't expose internal errors to users
- Rate limiting may be needed for production use
- Consider caching to reduce API calls

## Performance Considerations

- Transcript fetching is network-dependent
- Consider adding timeouts for slow networks
- Cache frequently requested transcripts if needed
- Monitor for memory leaks with long-running processes

## Final Reminder

**🚨 CRITICAL: Always run `npm test` after making changes! 🚨**

This is the single most important rule for maintaining compatibility with Claude Code and other MCP clients. Schema validation errors will break the integration, and the test suite is designed to catch these issues before they reach production.

## Questions?

When in doubt:
1. Run `npm test`
2. Check `TESTING.md` for detailed guidance
3. Look at existing tool schemas for examples
4. Ensure all compliance tests pass before committing
