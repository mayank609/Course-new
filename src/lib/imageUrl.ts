const DRIVE_ID_PATTERNS = [
  /drive\.google\.com\/file\/d\/([^/]+)/,
  /drive\.google\.com\/open\?id=([^&]+)/,
  /drive\.google\.com\/uc\?(?:export=\w+&)?id=([^&]+)/,
  /docs\.google\.com\/uc\?(?:export=\w+&)?id=([^&]+)/,
  /drive\.google\.com\/thumbnail\?id=([^&]+)/,
];

/**
 * Google Drive "share" links point at Drive's HTML viewer, not raw image bytes,
 * so <img src> can't render them. Rewrite to Google's image CDN, which serves
 * the actual bytes for publicly shared files and works as a direct src (the
 * drive.google.com/thumbnail endpoint is often blocked when embedded).
 */
export function toDirectImageUrl<T extends string | undefined>(url: T): T {
  if (!url) return url;
  for (const pattern of DRIVE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return `https://lh3.googleusercontent.com/d/${match[1]}=w1600` as T;
    }
  }
  return url;
}
