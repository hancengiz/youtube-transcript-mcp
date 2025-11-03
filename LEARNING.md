# Learning & Best Practices

This document captures key learnings and best practices discovered during the development and maintenance of the YouTube Transcript MCP Server.

## Version Management

### NPX and Version Control

**Learning**: While npx is supposed to always fetch the latest version, we encountered caching issues in practice.

**Our Approach (Belt and Suspenders)**:
```bash
# Using @latest explicitly (even though npx should do this anyway)
claude mcp add youtube-transcript npx @fabriqa.ai/youtube-transcript-mcp@latest
```

**Why we use @latest anyway**:
- Explicit is better than implicit
- Communicates intent clearly to users
- Acts as insurance against cache-related edge cases
- Minimal overhead, maximum clarity

**Cache Clearing**:
When testing new versions or experiencing version issues:
```bash
# Clear npx cache
npx clear-npx-cache

# Or manually remove cache directory
rm -rf ~/.npm/_npx
```

### Version Display in Startup Messages

**Learning**: Including version numbers in startup messages is crucial for debugging and user support.

**Implementation**:
```javascript
// Read version from package.json dynamically
const packageJson = JSON.parse(
  await fs.readFile(path.join(__dirname, "package.json"), "utf-8")
);
const VERSION = packageJson.version;

// Display in startup message
console.error(`YouTube Transcript MCP Server v${VERSION} running on stdio`);
```

**Benefits**:
- Users can easily verify which version is running
- Helps with debugging when users report issues
- Ensures version stays in sync with package.json automatically

## Schema Compliance

### JSON Schema Draft 2020-12 Requirement

**Critical Learning**: Claude API requires `$schema` field in all tool definitions.

**Required Format**:
```javascript
inputSchema: {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  properties: { /* ... */ },
  required: ["list", "of", "required"],
  additionalProperties: false
}
```

**Common Mistakes to Avoid**:
- ❌ Missing `$schema` field
- ❌ Using wrong draft version (draft-07 instead of 2020-12)
- ❌ Using unsupported keywords (like `default`)
- ❌ Missing `additionalProperties: false`

**Testing for Compliance**:
Always run `npm test` before committing. The test suite validates:
- Schema structure correctness
- JSON Schema draft 2020-12 compliance
- Functional behavior with real YouTube videos

## YouTube Transcript Specific Learnings

### URL Format Support

**Learning**: YouTube has many URL formats, and users will use all of them.

**Supported Formats**:
```javascript
// All of these should work:
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://m.youtube.com/watch?v=VIDEO_ID
VIDEO_ID (just the 11-character ID)
```

**Implementation**:
```javascript
const patterns = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
  /youtube\.com\/watch\?.*v=([^&\?\/]+)/,
  /^([a-zA-Z0-9_-]{11})$/,  // Direct video ID
];
```

### Transcript Availability

**Learning**: Not all YouTube videos have transcripts available.

**Common Scenarios**:
- Video has auto-generated captions ✓
- Video has manually uploaded captions ✓
- Video is live streaming ✗ (usually no transcript)
- Video is private/unlisted ✗ (may not be accessible)
- Video has transcripts disabled by creator ✗

**Error Handling**:
```javascript
if (!transcript || transcript.length === 0) {
  throw new Error("No transcript available for this video.");
}
```

### Language Selection

**Learning**: The `youtube-transcript` library doesn't expose a direct method to list all available languages.

**Workaround**:
- Provide a `get-transcript-languages` tool that attempts to fetch the default transcript
- Document common language codes in the response
- Allow users to try different language codes via the `lang` parameter

### Timestamp Formatting

**Learning**: Users have different preferences for timestamp formats.

**Our Approach**:
- Include timestamps by default (most users want them)
- Allow users to disable timestamps via `include_timestamps: false`
- Format timestamps as `[MM:SS]` or `[HH:MM:SS]` for readability

**Implementation**:
```javascript
formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
```

## Publishing Workflow

### Git and npm Publishing Protocol

**Learning**: Always follow a structured workflow when publishing updates.

**Established Protocol**:
1. **Make changes** → **Run tests** (`npm test`)
2. **Commit changes** → **Ask user** before pushing to git
3. **Push to git** → **ALWAYS ask user** about npm publish
4. **Bump version** → **Run tests again** → **Publish to npm**
5. **Push version bump** to git

**Why this sequence matters**:
- Tests catch schema compliance issues before publishing
- User approval ensures intentional releases
- Version bump comes after feature commit for clean history
- Second test run validates the version bump didn't break anything

### Version Bumping Strategy

**Semantic Versioning Guidelines**:
- **Patch** (1.0.x): Bug fixes, documentation updates, minor improvements
- **Minor** (1.x.0): New features, backwards-compatible changes
- **Major** (x.0.0): Breaking changes, major refactoring

**Examples for this project**:
- Documentation update → Patch (1.0.0 → 1.0.1)
- Add language selection feature → Minor (1.0.x → 1.1.0)
- Change schema structure → Major (1.x.x → 2.0.0)

## Development Best Practices

### Testing Strategy

**Learning**: Test with real YouTube videos during development.

**Our Approach**:
- Use a well-known public video for testing (e.g., "Never Gonna Give You Up")
- Test multiple URL formats
- Test with and without timestamps
- Test error cases (invalid URLs, missing transcripts)

### Documentation Maintenance

**Learning**: Keep multiple documentation sources in sync.

**Files to Update Together**:
1. **README.md** - Main user-facing documentation
2. **TESTING.md** - Testing procedures and validation
3. **LEARNING.md** - Historical learnings and best practices
4. **CLAUDE.md** - Instructions for AI assistant

**When to Update**:
- Installation commands change → Update all files with examples
- New feature added → Update README and TESTING
- Bug fixes → Update LEARNING with what was learned
- Version bumps → Let automation handle package.json updates

## Common Issues and Solutions

### Issue: Transcript Not Available

**Symptoms**:
- Error: "No transcript available for this video"
- User trying to get transcript from recent livestream
- Private or restricted video

**Solutions**:
1. Verify the video has captions on YouTube
2. Try different language codes
3. Check if video is publicly accessible
4. Some videos simply don't have transcripts

### Issue: Invalid URL Format

**Symptoms**:
- Error: "Invalid YouTube URL format"
- User provides a playlist URL instead of video URL
- URL contains extra parameters

**Solutions**:
1. Extract video ID more robustly
2. Provide helpful error messages
3. Document supported URL formats in README

### Issue: Language Not Found

**Symptoms**:
- Transcript exists but not in requested language
- User specifies invalid language code

**Solutions**:
1. Try fetching without language parameter (gets default)
2. Document common language codes
3. Provide `get-transcript-languages` tool to check availability

## Future Improvements

**Ideas for Consideration**:
1. Add direct language listing if library adds support
2. Support for playlist transcript fetching
3. Caching for frequently requested transcripts
4. Support for specific time ranges
5. Export formats (JSON, SRT, VTT)

## Key Takeaways

1. **Version Management**: Always use `@latest` and display version in startup
2. **Testing**: Run tests before every commit and publish
3. **Publishing**: Follow structured workflow with user confirmation
4. **Schema**: JSON Schema 2020-12 compliance is non-negotiable
5. **URL Parsing**: Support all common YouTube URL formats
6. **Error Handling**: Provide helpful messages when transcripts aren't available
7. **Documentation**: Keep all docs in sync when making changes

---

*This document should be updated with each significant learning or discovery during development and maintenance.*
