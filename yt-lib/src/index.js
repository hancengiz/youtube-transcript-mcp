/**
 * YouTube Transcript Library
 * A JavaScript library for fetching YouTube video transcripts
 */

// Export main API
export { YouTubeTranscriptFetcher } from "./fetcher.js";

// Export errors
export {
  YouTubeTranscriptError,
  TranscriptsDisabledError,
  NoTranscriptFoundError,
  VideoUnavailableError,
  InvalidVideoIdError,
  RequestBlockedError,
  YouTubeRequestFailedError,
  YouTubeDataUnparsableError,
  AgeRestrictedError,
  VideoUnplayableError,
  TranscriptParseError,
} from "./errors.js";

// Export parser (for advanced usage)
export { TranscriptParser } from "./parser.js";
