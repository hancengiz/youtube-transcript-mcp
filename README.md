# YouTube Transcript MCP Server

[![npm version](https://badge.fury.io/js/@fabriqa.ai%2Fyoutube-transcript-mcp.svg)](https://www.npmjs.com/package/@fabriqa.ai/youtube-transcript-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@fabriqa.ai/youtube-transcript-mcp.svg)](https://www.npmjs.com/package/@fabriqa.ai/youtube-transcript-mcp)

A Model Context Protocol (MCP) server that retrieves transcripts from YouTube videos for Claude Code. This server allows you to easily extract video transcripts without manually downloading or copying content, making it perfect for analyzing video content, summarizing talks, or extracting information from educational videos.

**npm package**: [@fabriqa.ai/youtube-transcript-mcp](https://www.npmjs.com/package/@fabriqa.ai/youtube-transcript-mcp)
**Author**: [Cengiz Han](https://cengizhan.com)

## Features

- **Get Video Transcripts**: Extract full transcripts from any YouTube video with available captions
- **Multiple URL Formats**: Support for all common YouTube URL formats (youtube.com, youtu.be, etc.)
- **Timestamp Support**: Include or exclude timestamps in transcript output
- **Language Selection**: Request transcripts in specific languages when available
- **Error Handling**: Graceful handling of videos without transcripts or invalid URLs
- **Efficient Context Usage**: Get only the transcript without loading unnecessary video metadata

## Installation

### Option A: Install from npm (Recommended)

```bash
npm install -g @fabriqa.ai/youtube-transcript-mcp
```

After installation, the server will be available globally. You can configure it by running:

```bash
# The package will be installed in your global node_modules
# Typically: /usr/local/lib/node_modules/@fabriqa.ai/youtube-transcript-mcp
```

### Option B: Install from source

1. Clone this repository:
```bash
git clone https://github.com/hancengiz/youtube-transcript-mcp.git
cd youtube-transcript-mcp
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### NEW: Automatic Registration to All MCP Clients

**🎉 The easiest way to get started!** This package now includes an automatic installer that can register the MCP server with **all supported clients** in one command:

```bash
# Register to ALL installed MCP clients (Claude Code, Claude Desktop, Cursor, etc.)
npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp register --all

# Or register to a specific client
npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp register --to claude-code
npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp register --to claude-desktop
npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp register --to cursor
```

**Supported clients:**
- `claude-code` - Claude Code CLI
- `claude-desktop` - Claude Desktop app
- `cursor` - Cursor IDE
- `cline` - Cline VSCode extension
- `roo-cline` - Roo-Cline VSCode extension
- `continue` - Continue.dev

**Other useful commands:**
```bash
# Detect which MCP clients are installed
npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp detect

# List registration status for all clients
npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp list

# Verify configuration for a specific client
npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp verify --client claude-code

# Unregister from a client
npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp unregister --from claude-code

# Show all available commands
npx -p @fabriqa.ai/youtube-transcript-mcp ytmcp help
```

### Alternative: Manual Configuration

#### Option 1: Using Claude Code CLI

**Recommended: Machine-Wide Installation**
```bash
# Add the MCP server for all projects (machine-wide)
claude mcp add --scope user youtube-transcript npx @fabriqa.ai/youtube-transcript-mcp@latest
```

**Understanding Scope Options:**

Claude Code supports three configuration scopes for MCP servers:

- **`--scope user`** (Recommended) - **Machine-wide**
  - Available in ALL projects and directories
  - Configured once, works everywhere
  - Perfect for tools you use regularly across different projects

- **`--scope local`** (Default) - **Project-specific**
  - Only available in the current directory and subdirectories
  - Useful for project-specific MCP servers
  - Each project must configure separately

- **`--scope project`** - **Explicit project**
  - For specific project configurations

**Example usage:**
```bash
# Machine-wide (recommended for youtube-transcript)
claude mcp add --scope user youtube-transcript npx @fabriqa.ai/youtube-transcript-mcp@latest

# Project-specific (if you prefer)
claude mcp add --scope local youtube-transcript npx @fabriqa.ai/youtube-transcript-mcp@latest

# Or use the convenience script
npx @fabriqa.ai/youtube-transcript-mcp/update-config.js
```

#### Option 2: Manual Configuration
Add to your `~/.claude.json`:

```json
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "npx",
      "args": [
        "@fabriqa.ai/youtube-transcript-mcp@latest"
      ]
    }
  }
}
```

This uses `npx` to automatically run the globally installed package without needing to specify paths.

### Quick Setup Script (Optional):

After installing via npm, you can use the included configuration script to automatically update your `~/.claude.json`:

```bash
npx @fabriqa.ai/youtube-transcript-mcp/update-config.js
```

Or if installed from source:
```bash
node update-config.js
```

This will automatically add the MCP server using `npx`, making it available machine-wide across all your projects.

### Manual Configuration:

For **Claude Desktop**, edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "youtube-transcript": {
      "command": "npx",
      "args": [
        "@fabriqa.ai/youtube-transcript-mcp@latest"
      ]
    }
  }
}
```

## Usage

Once configured, restart Claude Code. The following tools will be available:

### 1. get-transcript

Retrieve the transcript of a YouTube video.

**Parameters:**
- `url` (required): YouTube video URL or video ID
- `lang` (optional): Language code for transcript (e.g., 'en', 'es', 'fr'). Default: video's default language
- `include_timestamps` (optional): Include timestamps in output. Default: true

**Supported URL formats:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://m.youtube.com/watch?v=VIDEO_ID`
- `VIDEO_ID` (just the 11-character video ID)

**Example:**
```
Can you get the transcript from https://www.youtube.com/watch?v=LCEmiRjPEtQ?
```

```
Get the transcript from this video without timestamps: https://youtu.be/LCEmiRjPEtQ
```

```
Summarize the key learnings from this Andrej Karpathy talk: https://www.youtube.com/watch?v=LCEmiRjPEtQ
```

### 2. get-transcript-languages

Check what transcript languages are available for a video.

**Parameters:**
- `url` (required): YouTube video URL or video ID

**Example:**
```
What transcript languages are available for https://www.youtube.com/watch?v=LCEmiRjPEtQ?
```

## Example Workflow

Here's how you might use this MCP server with Claude Code:

1. **Extract a transcript to summarize a video**:
   ```
   Give me the key learnings from this Andrej Karpathy talk: https://www.youtube.com/watch?v=LCEmiRjPEtQ
   ```

2. **Analyze specific topics in a video**:
   ```
   Get the transcript from https://www.youtube.com/watch?v=LCEmiRjPEtQ and extract all mentions of "LLM" and "agents"
   ```

3. **Get transcripts in different languages**:
   ```
   What transcript languages are available for https://www.youtube.com/watch?v=LCEmiRjPEtQ?
   ```

4. **Extract quotes without timestamps** (for long videos):
   ```
   Get the transcript without timestamps from this video: https://www.youtube.com/watch?v=LCEmiRjPEtQ
   ```
   Note: This 60-minute video generates ~19k tokens without timestamps vs ~30k with timestamps.

5. **Research and content creation**:
   ```
   Get 3 key quotes from Andrej Karpathy about partial autonomy apps from https://www.youtube.com/watch?v=LCEmiRjPEtQ
   ```

## Advanced: Using Claude Code Sub-Agents for Context Efficiency

**Save 90% of your context when analyzing videos!**

Claude Code supports specialized sub-agents that can analyze YouTube videos in an isolated context, returning only the insights to your main conversation. This means you can analyze many videos without filling up your context window with large transcripts.

### Quick Example

Instead of this (fills your context with 20k+ tokens):
```
Get the transcript and analyze this video: [URL]
```

Do this (only ~2k tokens in your context):
```
Use sub-agent to analyze this video: [URL]
```

### The youtube-transcript-analyzer Agent

This specialized agent:
- ✅ Fetches transcripts in its own isolated context
- ✅ Analyzes the content thoroughly
- ✅ Returns ONLY the analysis to you
- ✅ Lets you analyze 10+ videos in one session
- ✅ Keeps your context clean and focused

### Learn More

**📖 [Complete Claude Code Sub-Agent Guide](./CLAUDE_CODE_AGENT_GUIDE.md)**

The guide includes:
- How sub-agents save context (with examples)
- Complete setup instructions for the youtube-transcript-analyzer agent
- Configuration files you can copy directly
- Real-world usage examples and workflows
- Advanced tips for analyzing multiple videos efficiently

**Perfect for:** Researchers, content creators, students, and anyone analyzing multiple videos in one session.

## Use Cases

- **Content Summarization**: Extract key learnings from hour-long technical talks (e.g., Andrej Karpathy's "Software in the Era of AI")
- **Research**: Analyze conference talks, academic lectures, and educational content without watching
- **Content Creation**: Get accurate quotes and references from video content for blog posts or articles
- **Learning & Education**: Quickly review lecture content, extract main concepts and examples
- **Accessibility**: Convert video content to searchable, readable text format
- **Interview Analysis**: Extract quotes and insights from podcast interviews and panel discussions
- **Technical Documentation**: Pull code examples and technical explanations from tutorial videos

## Benefits

- **Time Saving**: Get video content without watching the entire video
- **Context Efficiency**: Extract only the text content you need
- **Flexible Format**: Choose whether to include timestamps
- **Multi-language**: Access transcripts in different languages when available
- **Easy Integration**: Simple URL-based interface for Claude Code

## Technical Details

- Built with the [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk)
- Uses a custom-built YouTube transcript library (`yt-lib/`)
- Zero external dependencies for transcript fetching (uses native fetch API)
- Runs as a local Node.js process communicating via stdio
- Supports all YouTube videos with available transcripts/captions
- Direct integration with YouTube's Innertube API for reliable transcript access

## Limitations

### MCP Protocol Token Limit

The MCP (Model Context Protocol) infrastructure has a **25,000 token response limit** to protect Claude's context window and prevent performance issues. This limit is imposed by the MCP protocol layer, not by YouTube or this tool.

**What this means:**
- Very long video transcripts (typically 60+ minutes) with timestamps enabled may exceed this limit
- The transcript fetches successfully from YouTube, but MCP blocks the response if it's too large

**Symptoms:**
```
Error: MCP tool "get-transcript" response (30131 tokens) exceeds
maximum allowed tokens (25000). Please use pagination, filtering,
or limit parameters to reduce the response size.
```

**Solutions:**

1. **Disable timestamps** (recommended for long videos):
   ```
   Get the transcript without timestamps from https://www.youtube.com/watch?v=VIDEO_ID
   ```
   This typically reduces response size by 20-30%, making most videos fit within the limit.

2. **Request shorter videos** (under 60 minutes usually work with timestamps)

3. **Process in chunks**: For very long videos, you may need to work with the transcript data programmatically rather than through the MCP tool

**Real-world example (Andrej Karpathy's talk):**
- https://www.youtube.com/watch?v=LCEmiRjPEtQ (60-minute technical talk)
- With timestamps: ~30,000 tokens ❌ (exceeds 25k limit)
- Without timestamps: ~19,000 tokens ✅ (works perfectly)

**Workaround:** Simply ask "Get the transcript **without timestamps**" for long videos.

## Troubleshooting

### Server not appearing in Claude Code

1. Verify the path in your configuration file is correct
2. Ensure Node.js is installed and in your PATH
3. Check that dependencies are installed: `npm install`
4. Restart Claude Code completely
5. Check Claude Code logs for any error messages

### "No transcript available" errors

- Not all YouTube videos have transcripts
- Some videos only have auto-generated captions in certain languages
- Private or restricted videos cannot be accessed
- Try checking if the video has captions enabled on YouTube

### Language not found

- Use the `get-transcript-languages` tool to check available languages
- Common language codes: 'en', 'es', 'fr', 'de', 'ja', 'ko', 'pt', 'ru', 'zh', etc.
- Not all videos have transcripts in all languages

### Invalid URL errors

- Ensure you're using a valid YouTube URL format
- Video IDs should be exactly 11 characters
- Make sure the video exists and is publicly accessible

## Development

To modify or extend the server:

1. Edit `index.js` to add new tools or modify existing ones
2. Update the `ListToolsRequestSchema` handler to register new tools
3. Add corresponding handlers in the `CallToolRequestSchema` handler
4. Test your changes with `npm test`
5. Restart the server (restart Claude Code) to test changes

## Testing

Run the test suite:

```bash
npm test
```

This will validate:
- JSON schema compliance for Claude API
- Tool registration and listing
- Transcript fetching functionality
- Error handling
- URL parsing

## License

MIT

## Author

Created by [Cengiz Han](https://cengizhan.com)

## Contributing

Feel free to submit issues or pull requests to improve this MCP server.
