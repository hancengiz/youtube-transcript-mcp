/**
 * Transcript XML parser
 */

import { TranscriptParseError } from "./errors.js";

/**
 * HTML formatting tags to preserve when preserveFormatting is true
 */
const FORMATTING_TAGS = [
  "strong",
  "em",
  "b",
  "i",
  "mark",
  "small",
  "del",
  "ins",
  "sub",
  "sup",
];

/**
 * Parses YouTube transcript XML data
 */
export class TranscriptParser {
  constructor(preserveFormatting = false) {
    this.htmlRegex = this.getHtmlRegex(preserveFormatting);
  }

  /**
   * Creates the regex for removing HTML tags
   */
  getHtmlRegex(preserveFormatting) {
    if (preserveFormatting) {
      const formatsRegex = FORMATTING_TAGS.join("|");
      const pattern = `<\\/?(?!\\/?(?:${formatsRegex})\\b).*?\\b>`;
      return new RegExp(pattern, "gi");
    }
    return /<[^>]*>/gi;
  }

  /**
   * Decodes HTML entities in text
   */
  decodeHtmlEntities(text) {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
  }

  /**
   * Parses XML transcript data into structured snippets
   */
  parse(xmlData, videoId) {
    try {
      // Extract text elements using regex (avoiding XML parser dependencies)
      const textRegex = /<text\s+start="([^"]+)"\s+dur="([^"]+)"[^>]*>([^<]*)<\/text>/g;
      const snippets = [];
      let match;

      while ((match = textRegex.exec(xmlData)) !== null) {
        const start = parseFloat(match[1]);
        const duration = parseFloat(match[2]);
        let text = match[3];

        // Decode HTML entities
        text = this.decodeHtmlEntities(text);

        // Remove HTML tags according to preserveFormatting setting
        text = text.replace(this.htmlRegex, "");

        // Only add non-empty snippets
        if (text.trim()) {
          snippets.push({
            text: text.trim(),
            start,
            duration,
          });
        }
      }

      // Alternative: handle self-closing text tags or different formats
      if (snippets.length === 0) {
        // Try alternative parsing for edge cases
        const altRegex = /<text[^>]+start="([^"]+)"[^>]+dur="([^"]+)"[^>]*>([^<]*)<\/text>/g;
        while ((match = altRegex.exec(xmlData)) !== null) {
          const start = parseFloat(match[1]);
          const duration = parseFloat(match[2]);
          let text = this.decodeHtmlEntities(match[3]).replace(this.htmlRegex, "");

          if (text.trim()) {
            snippets.push({
              text: text.trim(),
              start,
              duration,
            });
          }
        }
      }

      return snippets;
    } catch (error) {
      throw new TranscriptParseError(
        videoId,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}
