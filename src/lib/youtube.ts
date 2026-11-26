export function getYouTubeVideoId(value: string) {
  if (!value.trim()) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;

    const host = url.hostname.toLowerCase();
    if (host === 'youtu.be') {
      const videoId = url.pathname.split('/').filter(Boolean)[0];
      return videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId) ? videoId : null;
    }

    if (!['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(host)) return null;

    const pathParts = url.pathname.split('/').filter(Boolean);
    const videoId = url.pathname === '/watch'
      ? url.searchParams.get('v')
      : pathParts[0] === 'embed' || pathParts[0] === 'shorts'
        ? pathParts[1]
        : null;

    return videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId) ? videoId : null;
  } catch {
    return null;
  }
}