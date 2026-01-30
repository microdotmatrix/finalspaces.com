/**
 * Slug generation utilities for FinalSpaces
 */

/**
 * Converts a name to a URL-friendly slug
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Creates a unique slug by appending a suffix if collision detected
 */
export async function createUniqueSlug(
  baseName: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> {
  const baseSlug = generateSlug(baseName);

  // Check if base slug is available
  const exists = await checkExists(baseSlug);
  if (!exists) {
    return baseSlug;
  }

  // Try with numeric suffixes
  let suffix = 2;
  while (suffix <= 100) {
    const candidateSlug = `${baseSlug}-${suffix}`;
    const candidateExists = await checkExists(candidateSlug);
    if (!candidateExists) {
      return candidateSlug;
    }
    suffix++;
  }

  // Fallback: use random suffix
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${randomSuffix}`;
}

/**
 * Validates a slug format
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
