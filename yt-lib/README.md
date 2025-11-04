# YouTube Transcript Library

A pure TypeScript library for fetching YouTube video transcripts. This library is designed to be used as a standalone package or integrated into other projects.

## Features

- ✅ Fetch transcripts from YouTube videos
- ✅ Support for multiple languages
- ✅ Auto-generated and manual transcripts
- ✅ List all available transcript languages
- ✅ TypeScript native with full type safety
- ✅ Zero dependencies (uses native fetch API)
- ✅ Comprehensive error handling
- ✅ Designed to be extracted as a separate npm package

## Architecture

This library is a custom implementation in modern JavaScript:

```
yt-lib/
├── src/
│   ├── index.ts       # Main exports
│   ├── types.ts       # TypeScript types and interfaces
│   ├── errors.ts      # Custom error classes
│   ├── parser.ts      # XML transcript parser
│   └── fetcher.ts     # Core fetching logic
├── package.json       # Package configuration
└── README.md          # This file
```

## Usage

### Basic Usage

```typescript
import { YouTubeTranscriptFetcher } from "./yt-lib/src/index.js";

const fetcher = new YouTubeTranscriptFetcher();

// Fetch a transcript
const transcript = await fetcher.fetchTranscript("dQw4w9WgXcQ", {
  languages: ["en"],
  preserveFormatting: false,
});

console.log(transcript.snippets);
// [
//   { text: "Never gonna give you up", start: 0, duration: 2.5 },
//   { text: "Never gonna let you down", start: 2.5, duration: 2.8 },
//   ...
// ]
```

### List Available Transcripts

```typescript
const transcripts = await fetcher.listTranscripts("dQw4w9WgXcQ");

console.log(transcripts);
// [
//   {
//     videoId: "dQw4w9WgXcQ",
//     language: "English",
//     languageCode: "en",
//     isGenerated: false,
//     isTranslatable: true,
//     ...
//   },
//   ...
// ]
```

### Multiple Language Preferences

```typescript
// Try German first, then English, then Spanish
const transcript = await fetcher.fetchTranscript("dQw4w9WgXcQ", {
  languages: ["de", "en", "es"],
});
```

### Extract Video ID from URL

```typescript
// All these work:
await fetcher.fetchTranscript("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
await fetcher.fetchTranscript("https://youtu.be/dQw4w9WgXcQ");
await fetcher.fetchTranscript("dQw4w9WgXcQ");
```

## API Reference

### YouTubeTranscriptFetcher

The main class for fetching transcripts.

#### Methods

##### `fetchTranscript(videoId, options?): Promise<FetchedTranscript>`

Fetches a transcript for a video.

**Parameters:**
- `videoId` (string): Video ID or URL
- `options` (object, optional):
  - `languages` (string[]): Language codes in priority order (default: `["en"]`)
  - `preserveFormatting` (boolean): Keep HTML formatting tags (default: `false`)

**Returns:** `Promise<FetchedTranscript>`

##### `listTranscripts(videoId): Promise<TranscriptInfo[]>`

Lists all available transcripts for a video.

**Parameters:**
- `videoId` (string): Video ID or URL

**Returns:** `Promise<TranscriptInfo[]>`

##### `extractVideoId(input): string`

Extracts video ID from various YouTube URL formats.

**Parameters:**
- `input` (string): Video ID or URL

**Returns:** Video ID string

## Types

### TranscriptSnippet

```typescript
interface TranscriptSnippet {
  text: string;
  start: number;
  duration: number;
}
```

### FetchedTranscript

```typescript
interface FetchedTranscript {
  snippets: TranscriptSnippet[];
  videoId: string;
  language: string;
  languageCode: string;
  isGenerated: boolean;
}
```

### TranscriptInfo

```typescript
interface TranscriptInfo {
  videoId: string;
  url: string;
  language: string;
  languageCode: string;
  isGenerated: boolean;
  translationLanguages: TranslationLanguage[];
  isTranslatable: boolean;
}
```

## Error Handling

The library provides specific error classes for different failure scenarios:

```typescript
import {
  YouTubeTranscriptError,
  TranscriptsDisabledError,
  NoTranscriptFoundError,
  VideoUnavailableError,
  RequestBlockedError,
} from "./yt-lib/src/index.js";

try {
  const transcript = await fetcher.fetchTranscript("some-video-id");
} catch (error) {
  if (error instanceof TranscriptsDisabledError) {
    console.log("Transcripts are disabled for this video");
  } else if (error instanceof NoTranscriptFoundError) {
    console.log("No transcript found in requested languages");
  } else if (error instanceof RequestBlockedError) {
    console.log("Request was blocked by YouTube");
  }
}
```

### Available Error Classes

- `YouTubeTranscriptError` - Base error class
- `TranscriptsDisabledError` - Transcripts disabled for video
- `NoTranscriptFoundError` - No transcript in requested language
- `VideoUnavailableError` - Video is unavailable
- `InvalidVideoIdError` - Invalid video ID format
- `RequestBlockedError` - Request blocked by YouTube
- `YouTubeRequestFailedError` - HTTP request failed
- `YouTubeDataUnparsableError` - Cannot parse YouTube data
- `AgeRestrictedError` - Video is age-restricted
- `VideoUnplayableError` - Video is unplayable
- `TranscriptParseError` - Cannot parse transcript XML

## Extracting as a Separate Package

This library is designed to be easily extracted and published as a standalone npm package:

1. **Copy the `yt-lib` folder** to a new repository
2. **Update package.json** with your package name and details
3. **Add a build script** if you want to compile TypeScript
4. **Publish to npm**: `npm publish`

The library has zero external dependencies and uses only native Node.js APIs (fetch), making it lightweight and easy to maintain.

## How Transcript Retrieval Works

This section explains the mechanism and flow of how transcripts are retrieved from YouTube, including URLs accessed and the underlying architecture.

### YouTube's Transcript Architecture

YouTube stores video transcripts separately from the video itself. Transcripts are available in two forms:

1. **Manual Transcripts** - Uploaded by video creators
2. **Auto-Generated Transcripts** - Created by YouTube's speech recognition

These transcripts are stored as **timed text tracks** (similar to subtitles) in XML format on YouTube's servers.

### The Retrieval Flow

#### Step 1: Fetch the Video Page HTML

**URL Accessed:**
```
https://www.youtube.com/watch?v={VIDEO_ID}
```

**What Happens:**
- The library fetches the public YouTube video page (the same page you see in a browser)
- This HTML contains embedded JavaScript with configuration data
- No authentication is required for public videos

**Why This Step:**
YouTube embeds critical API configuration data in the page HTML, including:
- The Innertube API key (YouTube's internal API)
- Initial video metadata
- Player configuration

#### Step 2: Extract the Innertube API Key

**What We Look For:**
```javascript
"INNERTUBE_API_KEY": "AIzaSy..."
```

**What Happens:**
- The library parses the HTML to find the `INNERTUBE_API_KEY`
- This key is embedded in the page's JavaScript configuration
- The key is public and changes periodically (YouTube rotates it)

**Why This Matters:**
The Innertube API is YouTube's internal API used by the web player. It provides access to:
- Video metadata
- Caption/transcript information
- Playability status
- Available quality levels

#### Step 3: Call YouTube's Innertube API

**URL Accessed:**
```
https://www.youtube.com/youtubei/v1/player?key={API_KEY}
```

**Request Payload:**
```json
{
  "context": {
    "client": {
      "clientName": "ANDROID",
      "clientVersion": "20.10.38"
    }
  },
  "videoId": "{VIDEO_ID}"
}
```

**What Happens:**
- The library makes a POST request to YouTube's Innertube API
- We identify as an Android client (more reliable than web client)
- YouTube returns comprehensive video metadata

**Response Contains:**
- `playabilityStatus` - Whether the video can be played
- `captions.playerCaptionsTracklistRenderer` - **Caption track information**
  - `captionTracks[]` - Array of available transcripts
  - `translationLanguages[]` - Available translation options

**Why Android Client:**
The Android client identifier provides more consistent access to transcript data compared to web clients, which may have additional restrictions.

#### Step 4: Parse Caption Track Metadata

**What We Extract:**
```json
{
  "captionTracks": [
    {
      "baseUrl": "https://www.youtube.com/api/timedtext?...",
      "name": { "simpleText": "English" },
      "languageCode": "en",
      "kind": "asr",  // "asr" = auto-generated
      "isTranslatable": true
    }
  ]
}
```

**Key Information:**
- `baseUrl` - The URL to fetch the actual transcript XML
- `languageCode` - ISO language code (e.g., 'en', 'es', 'ja')
- `kind: "asr"` - Indicates auto-generated transcript
- `isTranslatable` - Whether the transcript can be machine-translated

**What Happens:**
- The library catalogs all available transcripts
- Identifies which are manual vs auto-generated
- Builds a list of available languages

#### Step 5: Fetch the Transcript XML

**URL Accessed:**
```
https://www.youtube.com/api/timedtext?
  v={VIDEO_ID}
  &lang={LANGUAGE_CODE}
  &fmt=srv3
  &name=...
```

**What Happens:**
- The library requests the actual transcript data
- YouTube returns timed text in XML format
- This is the same data used by YouTube's subtitle/caption system

**Response Format (XML):**
```xml
<?xml version="1.0" encoding="utf-8" ?>
<transcript>
  <text start="0" dur="2.5">Never gonna give you up</text>
  <text start="2.5" dur="2.8">Never gonna let you down</text>
  <text start="5.3" dur="3.1">Never gonna run around and desert you</text>
</transcript>
```

**XML Structure:**
- `<text>` - Individual transcript snippet
- `start` - Timestamp in seconds when text appears
- `dur` - Duration in seconds the text is displayed
- Text content - The actual transcript text (may include HTML entities)

#### Step 6: Parse the XML

**What Happens:**
- The library parses the XML using regex (avoiding XML parser dependencies)
- Decodes HTML entities (`&amp;` → `&`, `&quot;` → `"`, etc.)
- Removes HTML formatting tags (unless `preserveFormatting: true`)
- Builds structured transcript objects

**Output:**
```javascript
{
  snippets: [
    { text: "Never gonna give you up", start: 0, duration: 2.5 },
    { text: "Never gonna let you down", start: 2.5, duration: 2.8 }
  ],
  videoId: "dQw4w9WgXcQ",
  language: "English",
  languageCode: "en",
  isGenerated: false
}
```

### Why This Approach Works

**No API Key Required:**
- Uses publicly accessible endpoints
- The Innertube API key is embedded in the public web page
- No OAuth or authentication needed for public videos

**Mimics Normal Browser Behavior:**
- Fetches the same data that the YouTube player uses
- Uses standard HTTP requests
- No web scraping of protected content

**Reliable Access:**
- Transcripts are served from YouTube's CDN
- Same infrastructure that powers YouTube's subtitle system
- High availability and performance

### When It Doesn't Work

**1. Transcripts Disabled by Owner**
- Video creator has disabled captions/subtitles
- The Innertube API returns no `captionTracks`
- Error: `TranscriptsDisabledError`

**2. Age-Restricted Videos**
- Require authentication to verify age
- Cannot be accessed without logged-in session
- Error: `AgeRestrictedError`

**3. Private/Unlisted Videos with Restrictions**
- May require authentication
- May have disabled transcript access
- Error: `VideoUnavailableError`

**4. IP Blocking / Rate Limiting**
- YouTube detects automated access
- Triggers bot detection (reCAPTCHA)
- Error: `RequestBlockedError`

**5. Caption Metadata vs Actual Access**
- Sometimes caption metadata exists but transcript URL returns 403
- This happens when owners disable programmatic access
- The transcript appears available but fetching fails

### URLs Summary

| Step | URL | Purpose |
|------|-----|---------|
| 1 | `https://www.youtube.com/watch?v={VIDEO_ID}` | Get video page HTML |
| 2 | (HTML parsing) | Extract Innertube API key |
| 3 | `https://www.youtube.com/youtubei/v1/player?key={KEY}` | Get video metadata & caption info |
| 4 | (JSON parsing) | Extract transcript URLs |
| 5 | `https://www.youtube.com/api/timedtext?v={ID}&lang={LANG}` | Get transcript XML |
| 6 | (XML parsing) | Convert to structured data |

### Design Decisions

- **No Dependencies**: Uses native fetch API and regex-based XML parsing
- **JavaScript Native**: Pure JavaScript/ES modules, no compilation needed
- **Error-First**: Comprehensive error handling with specific error types
- **Modular**: Clean separation of concerns (parser, fetcher, types, errors)
- **YouTube API Compatible**: Follows YouTube's Innertube API patterns
- **Extensible**: Easy to add formatters, proxies, or other features

## Multi-Client Fallback System

### What It Does

The library implements a **multi-client fallback mechanism** similar to yt-dlp. When fetching video metadata from YouTube's Innertube API, it tries multiple client types in order until one succeeds.

### Why It's Needed

YouTube's Innertube API behaves differently depending on which client makes the request:

- **ANDROID client**: Generally most reliable for transcripts, but may be blocked for some videos
- **WEB client**: Provides translation languages, but sometimes restricted
- **TV_EMBEDDED client**: Least restricted, works for age-gated content, but limited features

Some videos work with one client but not others. By trying multiple clients automatically, we maximize success rate.

### How It Works

```javascript
// When you create a fetcher
const fetcher = new YouTubeTranscriptFetcher();

// Internally, it tries clients in this order:
// 1. ANDROID (clientName: "ANDROID", clientVersion: "19.09.37")
// 2. WEB (clientName: "WEB", clientVersion: "2.20250103.01.00")
// 3. TV_EMBEDDED (clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER")

// If ANDROID fails → tries WEB
// If WEB fails → tries TV_EMBEDDED
// If all fail → throws the last error
```

### Client Details

**ANDROID Client:**
```javascript
{
  context: {
    client: {
      clientName: "ANDROID",
      clientVersion: "19.09.37",
      androidSdkVersion: 30,
    },
  },
}
```
- **Best for**: General transcript access
- **Pros**: Most reliable for standard videos
- **Cons**: May be blocked for restricted content

**WEB Client:**
```javascript
{
  context: {
    client: {
      clientName: "WEB",
      clientVersion: "2.20250103.01.00",
    },
  },
}
```
- **Best for**: Translation languages
- **Pros**: Provides full translation language list
- **Cons**: Sometimes more restricted than Android

**TV_EMBEDDED Client:**
```javascript
{
  context: {
    client: {
      clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER",
      clientVersion: "2.0",
    },
  },
}
```
- **Best for**: Age-restricted or embedded videos
- **Pros**: Least restrictions
- **Cons**: May have limited metadata

### Debug Mode

Enable debug logging to see which client succeeds:

```javascript
const fetcher = new YouTubeTranscriptFetcher({ debug: true });

// You'll see logs like:
// [yt-lib] Trying ANDROID client for video dQw4w9WgXcQ
// [yt-lib] ANDROID response status: 200 OK
// [yt-lib] ANDROID client succeeded
```

### Transparent Error Reporting

When a request fails, the library now provides **actual evidence** instead of speculation:

```javascript
try {
  await fetcher.fetchTranscript(videoId);
} catch (error) {
  // Error message includes:
  // - HTTP status code (e.g., 403, 404)
  // - Response body preview
  // - Actual URL that was accessed
  // - Which client failed

  console.error(error.message);
  // Example:
  // "HTTP 403: Forbidden
  //
  //  EVIDENCE: Attempted to fetch transcript from:
  //  https://www.youtube.com/api/timedtext?v=...
  //
  //  Response preview:
  //  <?xml version="1.0"?><error>Access denied</error>
  //
  //  This is the actual error from YouTube's server, not speculation."
}
```

### What This Means for You

**Without multi-client fallback:**
```
Video fails with ANDROID client → Error thrown → User sees failure
```

**With multi-client fallback:**
```
Video fails with ANDROID → Try WEB → WEB succeeds → User gets transcript
```

This significantly improves success rate, especially for:
- Age-restricted videos
- Region-restricted content
- Videos with special access requirements
- Videos that work better with specific clients

### Evidence-Based Error Handling

The library follows a **"show, don't tell"** philosophy for errors:

❌ **Old approach** (speculation):
```
"Video owner has disabled programmatic transcript access"
```

✅ **New approach** (evidence):
```
"HTTP 403: Forbidden

EVIDENCE: GET https://www.youtube.com/api/timedtext?v=ABC...
Response: <?xml version="1.0"?><error>Access denied</error>

Tried clients: ANDROID (403), WEB (403), TV_EMBEDDED (403)
All clients failed with same error."
```

This allows you to:
1. **See exactly what failed** (HTTP status, URL, response)
2. **Understand why it failed** (actual server response)
3. **Debug issues** (know which clients were tried)
4. **Report problems** (provide concrete evidence in bug reports)

## Contributing

This library is part of the `youtube-transcript-mcp` project but is designed to be standalone. Contributions are welcome!

## License

MIT
