const BLOCKED_PATTERNS = [
  /\b(fag|faggot|dyke|tranny)\b/i,
  /\b(nigger|nigga|chink|spic|kike)\b/i,
  /\b(whore|slut|cunt)\b/i,
  /\b(kill yourself|kys|go die)\b/i,
  /\b(rape|rapist)\b/i,
  /\b(nazi|hitler did nothing wrong)\b/i,
] as const;

function normalizeInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function containsBlockedLanguage(value: string): boolean {
  const normalized = normalizeInput(value);
  if (!normalized) {
    return false;
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(normalized)) {
      return true;
    }
  }

  return false;
}
