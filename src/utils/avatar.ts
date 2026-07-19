// Neutral placeholder shown when a mentor has no profile image or the URL fails to load.
export const FALLBACK_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#e5e7eb"/><circle cx="32" cy="24" r="12" fill="#9ca3af"/><path d="M8 58c0-13.3 10.7-22 24-22s24 8.7 24 22" fill="#9ca3af"/></svg>`
  );

export const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = FALLBACK_AVATAR;
};
