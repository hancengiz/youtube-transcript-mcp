/**
 * Types and interfaces for the YouTube Transcript library
 *
 * This file contains JSDoc type definitions for documentation purposes.
 * In JavaScript, these are not enforced at runtime.
 */

/**
 * @typedef {Object} TranscriptSnippet
 * @property {string} text - The text content of this snippet
 * @property {number} start - The timestamp at which this snippet appears (in seconds)
 * @property {number} duration - The duration for which this snippet appears (in seconds)
 */

/**
 * @typedef {Object} FetchedTranscript
 * @property {TranscriptSnippet[]} snippets - Array of transcript snippets
 * @property {string} videoId - Video ID
 * @property {string} language - Language name
 * @property {string} languageCode - Language code (e.g., 'en', 'de')
 * @property {boolean} isGenerated - Whether this transcript is auto-generated
 */

/**
 * @typedef {Object} TranslationLanguage
 * @property {string} language - Language name
 * @property {string} languageCode - Language code
 */

/**
 * @typedef {Object} TranscriptInfo
 * @property {string} videoId - Video ID
 * @property {string} url - URL to fetch the transcript XML
 * @property {string} language - Language name
 * @property {string} languageCode - Language code
 * @property {boolean} isGenerated - Whether this is auto-generated
 * @property {TranslationLanguage[]} translationLanguages - Available translation languages
 * @property {boolean} isTranslatable - Whether this transcript can be translated
 */

// No exports needed - this is just for documentation
export {};
