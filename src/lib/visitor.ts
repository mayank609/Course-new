// A stable per-browser id used only to group a visitor's own add-to-cart /
// checkout funnel steps together for the admin's cart-tracking screen — not
// a cross-site tracker. Falls back to a fresh id each call when storage is
// unavailable (private browsing, disabled storage) so tracking degrades
// gracefully instead of throwing.
const STORAGE_KEY = "sp_visitor_id";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
