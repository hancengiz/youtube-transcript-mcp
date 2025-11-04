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

### If installed via npm (Recommended):

#### Option 1: Using Claude Code CLI (Easiest)
```bash
# Add the MCP server
claude mcp add youtube-transcript npx @fabriqa.ai/youtube-transcript-mcp@latest

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
Can you get the transcript from https://www.youtube.com/watch?v=dQw4w9WgXcQ?
```

```
Get the transcript from this video without timestamps: https://youtu.be/dQw4w9WgXcQ
```

```
Get the Spanish transcript from https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

### 2. get-transcript-languages

Check what transcript languages are available for a video.

**Parameters:**
- `url` (required): YouTube video URL or video ID

**Example:**
```
What transcript languages are available for https://www.youtube.com/watch?v=dQw4w9WgXcQ?
```

## Example Workflow

Here's how you might use this MCP server with Claude Code:

1. **Extract a transcript to summarize a video**:
   ```
   Get the transcript from https://www.youtube.com/watch?v=VIDEO_ID and summarize the key points
   ```

2. **Analyze specific topics in a video**:
   ```
   Get the transcript from this tech talk and extract all mentions of "machine learning"
   ```

3. **Get transcripts in different languages**:
   ```
   Get the Spanish version of the transcript from https://youtu.be/VIDEO_ID
   ```

4. **Extract quotes without timestamps**:
   ```
   Get the transcript without timestamps from this video: https://www.youtube.com/watch?v=VIDEO_ID
   ```

## Use Cases

- **Content Summarization**: Quickly summarize long videos without watching them
- **Research**: Extract information from educational videos and lectures
- **Content Creation**: Get quotes and references from video content
- **Accessibility**: Convert video content to text for easier reading
- **Translation**: Use transcripts as a base for translation work
- **SEO**: Extract video content for blog posts or articles

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
