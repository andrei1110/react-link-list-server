export function normalizeUrl(url: string): string {
  if (!url) return url;

  let finalUrl = url.trim();

  if (!/^https?:\/\//i.test(finalUrl)) {
    finalUrl = `https://${finalUrl}`;
  }

  if (/^http:\/\//i.test(finalUrl)) {
    finalUrl = finalUrl.replace(/^http:\/\//i, 'https://');
  }

  try {
    new URL(finalUrl);
    return finalUrl;
  } catch {
    throw new Error('Invalid URL');
  }
}
