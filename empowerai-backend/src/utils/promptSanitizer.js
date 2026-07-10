/**
 * promptSanitizer.js — neutralise prompt-injection delivery mechanisms in
 * user-supplied text before it is embedded in AI prompts.
 *
 * Mirrors ai-service/app/core/sanitize.py so both tiers apply the same
 * rules (defense in depth).
 */

// C0/C1 control characters except \n (\x0a) and \t (\x09)
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]/g;

// Fake chat-transcript markers that try to open a new role turn
const ROLE_MARKERS = /^\s*(system|assistant|user|tool)\s*:/gim;

function sanitizeForPrompt(text, maxChars = 15000) {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text.replace(CONTROL_CHARS, '');
  // Defuse rather than delete — "System: Administrator" in a CV stays
  // readable but can't masquerade as a chat role.
  cleaned = cleaned.replace(ROLE_MARKERS, (m) => m.replace(':', ' -'));

  return cleaned.slice(0, maxChars).trim();
}

module.exports = { sanitizeForPrompt };
