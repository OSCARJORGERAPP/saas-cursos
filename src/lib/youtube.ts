/** Extrae el id de video de URLs de YouTube (watch, youtu.be, embed, shorts). */
export function youtubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (!u.hostname.endsWith("youtube.com")) return null;
    if (u.pathname === "/watch") return u.searchParams.get("v");
    const m = u.pathname.match(/^\/(embed|shorts)\/([\w-]{6,})/);
    return m ? m[2] : null;
  } catch {
    return null;
  }
}
