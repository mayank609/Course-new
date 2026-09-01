const DRIVE_ID_PATTERNS = [
  /drive\.google\.com\/file\/d\/([^/]+)/,
  /drive\.google\.com\/open\?id=([^&]+)/,
  /drive\.google\.com\/uc\?(?:export=\w+&)?id=([^&]+)/,
  /docs\.google\.com\/uc\?(?:export=\w+&)?id=([^&]+)/,
];

/**
 * Google Drive "share" links point at Drive's HTML viewer, not raw image bytes,
 * so <img src> can't render them. Rewrite to Drive's thumbnail endpoint, which
 * serves the actual image and works as a direct src.
 */
export function toDirectImageUrl<T extends string | undefined>(url: T): T {
  if (!url) return url;
  for (const pattern of DRIVE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600` as T;
    }
  }
  return url;
}
