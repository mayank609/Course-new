// Pulls the 11-character video id out of any common YouTube URL shape
// (watch?v=, youtu.be/, /embed/, /shorts/) or returns the input unchanged if
// it already looks like a bare id, so the admin can paste whatever they copy.
export function extractYoutubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtube\.com\/embed\/|youtu\.be\/)([\w-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match) return match[1];
  }
  if (/^[\w-]{11}$/.test(value)) return value;
  return null;
}
