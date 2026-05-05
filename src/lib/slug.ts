/**
 * Generates a URL-safe slug from a nursery name.
 *
 * Why client-side and not stored in the DB:
 *   - Keeps the schema lean for now
 *   - Names are stable (renaming a nursery is rare)
 *   - For 6, 600, or 6,000 nurseries, in-memory lookup is fine
 *
 * If the dataset grows past ~50k or names start colliding, promote
 * this to a unique `slug` column with a Prisma migration.
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
