/**
 * Core YouTube transcript fetching logic
 */

// Types are not imported in JavaScript - using JSDoc instead
import {
  TranscriptsDisabledError,
  VideoUnavailableError,
  InvalidVideoIdError,
  RequestBlockedError,
  YouTubeRequestFailedError,
  YouTubeDataUnparsableError,
  AgeRestrictedError,
  VideoUnplayableError,
  NoTranscriptFoundError,
} from "./errors.js";
import { TranscriptParser } from "./parser.js";

const WATCH_URL = "https://www.youtube.com/watch?v=";
const INNERTUBE_API_URL = "https://www.youtube.com/youtubei/v1/player?key=";
const GET_TRANSCRIPT_URL = "https://www.youtube.com/youtubei/v1/get_transcript?key=";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)";

/**
 * Playability status enum
 */
const PlayabilityStatus = {
  OK: "OK",
  ERROR: "ERROR",
  LOGIN_REQUIRED: "LOGIN_REQUIRED",
};

/**
 * Client configurations for fallback
 */
const CLIENTS = {
  ANDROID: {
    context: {
      client: {
        clientName: "ANDROID",
        clientVersion: "19.09.37",
        androidSdkVersion: 30,
      },
    },
  },
  WEB: {
    context: {
      client: {
        clientName: "WEB",
        clientVersion: "2.20250103.01.00",
      },
    },
  },
  TV_EMBEDDED: {
    context: {
      client: {
        clientName: "TVHTML5_SIMPLY_EMBEDDED_PLAYER",
        clientVersion: "2.0",
      },
    },
  },
};

/**
 * Main class for fetching YouTube transcripts
 */
export class YouTubeTranscriptFetcher {
  constructor(options = {}) {
    this.debug = options.debug || false;
  }

  /**
   * Log debug information
   */
  log(...args) {
    if (this.debug) {
      console.error('[yt-lib]', ...args);
    }
  }
  /**
   * Extracts video ID from various YouTube URL formats
   */
  extractVideoId(input) {
    // Already a video ID (11 characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input;
    }

    // URL patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\?\/]+)/,
      /youtube\.com\/watch\?.*v=([^&\?\/]+)/,
      /youtube\.com\/v\/([^&\?\/]+)/,
      /youtube\.com\/e\/([^&\?\/]+)/,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    throw new InvalidVideoIdError(input);
  }

  /**
   * Fetches the HTML content of a YouTube video page
   */
  async fetchVideoHtml(videoId) {
    try {
      const response = await fetch(`${WATCH_URL}${videoId}`, {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      if (response.status === 429) {
        throw new RequestBlockedError(videoId);
      }

      if (!response.ok) {
        throw new YouTubeRequestFailedError(
          videoId,
          response.status,
          response.statusText
        );
      }

      return await response.text();
    } catch (error) {
      if (error instanceof RequestBlockedError ||
          error instanceof YouTubeRequestFailedError) {
        throw error;
      }
      throw new YouTubeRequestFailedError(
        videoId,
        0,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Extracts the Innertube API key from the HTML
   */
  extractInnertubeApiKey(html, videoId) {
    const pattern = /"INNERTUBE_API_KEY":\s*"([a-zA-Z0-9_-]+)"/;
    const match = html.match(pattern);

    if (match && match[1]) {
      return match[1];
    }

    // Check for reCAPTCHA
    if (html.includes('class="g-recaptcha"')) {
      throw new RequestBlockedError(videoId);
    }

    throw new YouTubeDataUnparsableError(videoId);
  }

  /**
   * Fetches data from YouTube's Innertube API with specific client
   */
  async fetchInnertubeDataWithClient(videoId, apiKey, clientConfig, clientName) {
    this.log(`Trying ${clientName} client for video ${videoId}`);

    try {
      const response = await fetch(`${INNERTUBE_API_URL}${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": USER_AGENT,
        },
        body: JSON.stringify({
          context: clientConfig.context,
          videoId: videoId,
        }),
      });

      this.log(`${clientName} response status: ${response.status} ${response.statusText}`);

      if (response.status === 429) {
        throw new RequestBlockedError(videoId);
      }

      if (!response.ok) {
        const errorText = await response.text();
        this.log(`${clientName} failed with body:`, errorText.slice(0, 200));
        throw new YouTubeRequestFailedError(
          videoId,
          response.status,
          response.statusText
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof RequestBlockedError ||
          error instanceof YouTubeRequestFailedError) {
        throw error;
      }
      throw new YouTubeRequestFailedError(
        videoId,
        0,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Fetches data from YouTube's Innertube API with client fallback
   */
  async fetchInnertubeData(videoId, apiKey) {
    const clientOrder = ['ANDROID', 'WEB', 'TV_EMBEDDED'];
    let lastError = null;

    for (const clientName of clientOrder) {
      try {
        const data = await this.fetchInnertubeDataWithClient(
          videoId,
          apiKey,
          CLIENTS[clientName],
          clientName
        );
        this.log(`${clientName} client succeeded`);
        return data;
      } catch (error) {
        this.log(`${clientName} client failed:`, error.message);
        lastError = error;
        // Try next client
        continue;
      }
    }

    // All clients failed
    throw lastError;
  }

  /**
   * Validates playability status from Innertube response
   */
  assertPlayability(playabilityStatus, videoId) {
    if (!playabilityStatus) {
      return;
    }

    const status = playabilityStatus.status;
    const reason = playabilityStatus.reason;

    if (status === PlayabilityStatus.OK) {
      return;
    }

    if (status === PlayabilityStatus.LOGIN_REQUIRED) {
      if (reason === "Sign in to confirm you're not a bot") {
        throw new RequestBlockedError(videoId);
      }
      if (reason === "This video may be inappropriate for some users.") {
        throw new AgeRestrictedError(videoId);
      }
    }

    if (status === PlayabilityStatus.ERROR) {
      if (reason === "This video is unavailable") {
        if (videoId.startsWith("http://") || videoId.startsWith("https://")) {
          throw new InvalidVideoIdError(videoId);
        }
        throw new VideoUnavailableError(videoId);
      }
    }

    // Extract subreasons if available
    const subReasons = [];
    const errorScreen = playabilityStatus.errorScreen?.playerErrorMessageRenderer;
    if (errorScreen?.subreason?.runs) {
      subReasons.push(...errorScreen.subreason.runs.map((r) => r.text || ""));
    }

    throw new VideoUnplayableError(videoId, reason, subReasons);
  }

  /**
   * Extracts captions JSON from Innertube response
   */
  extractCaptionsJson(innertubeData, videoId) {
    this.assertPlayability(innertubeData.playabilityStatus, videoId);

    const captionsJson =
      innertubeData.captions?.playerCaptionsTracklistRenderer;

    if (!captionsJson || !captionsJson.captionTracks) {
      throw new TranscriptsDisabledError(videoId);
    }

    return captionsJson;
  }

  /**
   * Lists all available transcripts for a video
   */
  async listTranscripts(videoId) {
    // Extract video ID if URL provided
    videoId = this.extractVideoId(videoId);

    // Fetch HTML and extract API key
    const html = await this.fetchVideoHtml(videoId);
    const apiKey = this.extractInnertubeApiKey(html, videoId);

    // Fetch Innertube data
    const innertubeData = await this.fetchInnertubeData(videoId, apiKey);

    // Extract captions
    const captionsJson = this.extractCaptionsJson(innertubeData, videoId);

    // Parse translation languages
    const translationLanguages = (
      captionsJson.translationLanguages || []
    ).map((tl) => ({
      language: tl.languageName.runs[0].text,
      languageCode: tl.languageCode,
    }));

    // Parse caption tracks
    const transcripts = (captionsJson.captionTracks || []).map(
      (track) => ({
        videoId,
        url: track.baseUrl.replace("&fmt=srv3", ""),
        language:
          track.name.runs?.[0]?.text || track.name.simpleText || track.languageCode,
        languageCode: track.languageCode,
        isGenerated: track.kind === "asr",
        translationLanguages: track.isTranslatable ? translationLanguages : [],
        isTranslatable: !!track.isTranslatable,
      })
    );

    return transcripts;
  }

  /**
   * Fetches the transcript XML from the provided URL
   */
  async fetchTranscriptXml(url, videoId) {
    this.log(`Fetching transcript XML from: ${url.slice(0, 100)}...`);

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      this.log(`Transcript XML response: ${response.status} ${response.statusText}`);

      if (response.status === 429) {
        throw new RequestBlockedError(videoId);
      }

      if (!response.ok) {
        const errorBody = await response.text();
        this.log(`Transcript XML fetch failed with body:`, errorBody.slice(0, 500));

        const errorMessage =
          `HTTP ${response.status}: ${response.statusText}\n\n` +
          `EVIDENCE: Attempted to fetch transcript from:\n${url.slice(0, 150)}...\n\n` +
          `Response preview:\n${errorBody.slice(0, 200)}...\n\n` +
          `This is the actual error from YouTube's server, not speculation.`;

        throw new YouTubeRequestFailedError(
          videoId,
          response.status,
          errorMessage
        );
      }

      const xmlData = await response.text();
      this.log(`Received XML data, length: ${xmlData.length}`);
      return xmlData;
    } catch (error) {
      if (error instanceof RequestBlockedError ||
          error instanceof YouTubeRequestFailedError) {
        throw error;
      }
      throw new YouTubeRequestFailedError(
        videoId,
        0,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Fetches a transcript for a video
   */
  async fetchTranscript(videoId, options = {}) {
    const { languages = ["en"], preserveFormatting = false } = options;

    // Extract video ID if URL provided
    videoId = this.extractVideoId(videoId);

    // Get all available transcripts
    const availableTranscripts = await this.listTranscripts(videoId);

    if (availableTranscripts.length === 0) {
      throw new TranscriptsDisabledError(videoId);
    }

    // Find the best matching transcript
    let selectedTranscript = null;

    for (const languageCode of languages) {
      // First try manually created transcripts
      selectedTranscript = availableTranscripts.find(
        (t) => t.languageCode === languageCode && !t.isGenerated
      ) || null;

      if (selectedTranscript) break;

      // Then try auto-generated transcripts
      selectedTranscript = availableTranscripts.find(
        (t) => t.languageCode === languageCode && t.isGenerated
      ) || null;

      if (selectedTranscript) break;
    }

    if (!selectedTranscript) {
      throw new NoTranscriptFoundError(
        videoId,
        languages,
        availableTranscripts.map((t) => t.languageCode)
      );
    }

    // Fetch the actual transcript XML
    const xmlData = await this.fetchTranscriptXml(selectedTranscript.url, videoId);

    // Parse the XML
    const parser = new TranscriptParser(preserveFormatting);
    const snippets = parser.parse(xmlData, videoId);

    return {
      snippets,
      videoId,
      language: selectedTranscript.language,
      languageCode: selectedTranscript.languageCode,
      isGenerated: selectedTranscript.isGenerated,
    };
  }

  /**
   * Fetches the transcript using YouTube's get_transcript endpoint (like the web player)
   */
  async fetchTranscriptData(videoId, apiKey, languageCode) {
    this.log(`Fetching transcript via get_transcript endpoint for ${videoId}, lang: ${languageCode}`);

    try {
      const response = await fetch(`${GET_TRANSCRIPT_URL}${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": USER_AGENT,
          "Accept-Language": "en-US,en;q=0.9",
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20250103.01.00",
            },
          },
          params: this.createTranscriptParams(videoId, languageCode),
        }),
      });

      this.log(`get_transcript response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorBody = await response.text();
        this.log(`Transcript fetch failed with body:`, errorBody.slice(0, 500));

        throw new YouTubeRequestFailedError(
          videoId,
          response.status,
          `Failed to fetch transcript via get_transcript endpoint: ${response.statusText}`
        );
      }

      const data = await response.json();
      this.log(`Received transcript data, has actions:`, !!data.actions);
      return data;
    } catch (error) {
      if (error instanceof YouTubeRequestFailedError) {
        throw error;
      }
      throw new YouTubeRequestFailedError(
        videoId,
        0,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  /**
   * Create params for get_transcript API (base64 encoded protobuf)
   * This mimics what YouTube's web player does
   */
  createTranscriptParams(videoId, languageCode = "en") {
    // YouTube uses base64-encoded protobuf params
    // For now, try without params or with a simple format
    // We'll need to reverse engineer this if it doesn't work
    return "";
  }

  /**
   * Parse transcript from get_transcript response
   */
  parseTranscriptResponse(data, videoId) {
    this.log(`Parsing transcript response for ${videoId}`);

    try {
      // YouTube's get_transcript returns data in actions array
      const actions = data.actions || [];
      const snippets = [];

      for (const action of actions) {
        const updateEngagementPanelAction = action.updateEngagementPanelAction;
        if (!updateEngagementPanelAction) continue;

        // Extract transcript segments from the response
        // The structure varies, need to traverse it
        // This is a simplified version - may need adjustment
        const content = updateEngagementPanelAction.content;
        // TODO: Parse the actual transcript structure from the response
      }

      return snippets;
    } catch (error) {
      this.log(`Failed to parse transcript response:`, error.message);
      throw new Error(`Could not parse transcript data: ${error.message}`);
    }
  }
}
