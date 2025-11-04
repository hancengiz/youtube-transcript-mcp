/**
 * Custom error classes for YouTube Transcript API
 */

const WATCH_URL = "https://www.youtube.com/watch?v=";

/**
 * Base exception for all YouTube Transcript errors
 */
export class YouTubeTranscriptError extends Error {
  constructor(message) {
    super(message);
    this.name = "YouTubeTranscriptError";
  }
}

/**
 * Raised when transcripts are disabled for a video
 */
export class TranscriptsDisabledError extends YouTubeTranscriptError {
  constructor(videoId) {
    super(
      `Transcripts are disabled for video: ${WATCH_URL}${videoId}\n\n` +
        `This means the video owner has disabled subtitles/captions for this video.`
    );
    this.name = "TranscriptsDisabledError";
    this.videoId = videoId;
  }
}

/**
 * Raised when no transcript is found for the requested language codes
 */
export class NoTranscriptFoundError extends YouTubeTranscriptError {
  constructor(videoId, requestedLanguages, availableLanguages) {
    super(
      `No transcripts found for video: ${WATCH_URL}${videoId}\n\n` +
        `Requested languages: ${requestedLanguages.join(", ")}\n` +
        `Available languages: ${availableLanguages.length > 0 ? availableLanguages.join(", ") : "None"}`
    );
    this.name = "NoTranscriptFoundError";
    this.videoId = videoId;
    this.requestedLanguages = requestedLanguages;
    this.availableLanguages = availableLanguages;
  }
}

/**
 * Raised when the video is unavailable
 */
export class VideoUnavailableError extends YouTubeTranscriptError {
  constructor(videoId) {
    super(
      `The video is no longer available: ${WATCH_URL}${videoId}\n\n` +
        `This could mean the video has been deleted, is private, or is otherwise inaccessible.`
    );
    this.name = "VideoUnavailableError";
    this.videoId = videoId;
  }
}

/**
 * Raised when the video ID is invalid
 */
export class InvalidVideoIdError extends YouTubeTranscriptError {
  constructor(videoId) {
    super(
      `Invalid video ID: ${videoId}\n\n` +
        `Make sure you're providing the video ID, not the full URL.\n` +
        `Example: "dQw4w9WgXcQ" not "https://www.youtube.com/watch?v=dQw4w9WgXcQ"`
    );
    this.name = "InvalidVideoIdError";
    this.videoId = videoId;
  }
}

/**
 * Raised when YouTube is blocking requests
 */
export class RequestBlockedError extends YouTubeTranscriptError {
  constructor(videoId) {
    super(
      `Request to YouTube was blocked for video: ${WATCH_URL}${videoId}\n\n` +
        `This usually happens when:\n` +
        `1. Too many requests from your IP address\n` +
        `2. Your IP is from a cloud provider (AWS, GCP, Azure, etc.)\n` +
        `3. YouTube's bot detection triggered\n\n` +
        `Try again later or use a different network.`
    );
    this.name = "RequestBlockedError";
    this.videoId = videoId;
  }
}

/**
 * Raised when the request fails due to an HTTP error
 */
export class YouTubeRequestFailedError extends YouTubeTranscriptError {
  constructor(videoId, statusCode, statusText) {
    super(
      `YouTube request failed for video: ${WATCH_URL}${videoId}\n\n` +
        `HTTP ${statusCode}: ${statusText}`
    );
    this.name = "YouTubeRequestFailedError";
    this.videoId = videoId;
    this.statusCode = statusCode;
    this.statusText = statusText;
  }
}

/**
 * Raised when YouTube data cannot be parsed
 */
export class YouTubeDataUnparsableError extends YouTubeTranscriptError {
  constructor(videoId) {
    super(
      `Could not parse YouTube data for video: ${WATCH_URL}${videoId}\n\n` +
        `This is unusual and may indicate YouTube has changed their page structure. ` +
        `Please report this issue.`
    );
    this.name = "YouTubeDataUnparsableError";
    this.videoId = videoId;
  }
}

/**
 * Raised when the video is age-restricted
 */
export class AgeRestrictedError extends YouTubeTranscriptError {
  constructor(videoId) {
    super(
      `Video is age-restricted: ${WATCH_URL}${videoId}\n\n` +
        `Age-restricted videos require authentication, which is not currently supported.`
    );
    this.name = "AgeRestrictedError";
    this.videoId = videoId;
  }
}

/**
 * Raised when the video is unplayable
 */
export class VideoUnplayableError extends YouTubeTranscriptError {
  constructor(videoId, reason, subReasons = []) {
    const reasonText = reason || "No reason specified";
    const subReasonText =
      subReasons.length > 0
        ? `\n\nAdditional details:\n${subReasons.map((r) => `  - ${r}`).join("\n")}`
        : "";

    super(
      `Video is unplayable: ${WATCH_URL}${videoId}\n\n` +
        `Reason: ${reasonText}${subReasonText}`
    );
    this.name = "VideoUnplayableError";
    this.videoId = videoId;
    this.reason = reason;
    this.subReasons = subReasons;
  }
}

/**
 * Raised when transcript XML cannot be parsed
 */
export class TranscriptParseError extends YouTubeTranscriptError {
  constructor(videoId, originalError) {
    super(
      `Failed to parse transcript XML for video: ${WATCH_URL}${videoId}\n\n` +
        `Error: ${originalError.message}`
    );
    this.name = "TranscriptParseError";
    this.videoId = videoId;
    this.originalError = originalError;
  }
}
