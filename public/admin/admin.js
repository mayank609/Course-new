async function api(path, opts = {}) {
  const res = await fetch(`/api/admin${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (res.status === 401) {
    window.location.href = "/admin/login.html";
    throw new Error("Not authenticated");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function requireAuth() {
  try {
    return await api("/me");
  } catch {
    window.location.href = "/admin/login.html";
    throw new Error("redirecting");
  }
}

async function wireLogout() {
  const link = document.querySelector("[data-logout]");
  if (!link) return;
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    await api("/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/admin/login.html";
  });
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
