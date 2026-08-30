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

function downloadCSV(data, filename = "export.csv", headers = []) {
  if (!data || data.length === 0) {
    alert("No data available to export!");
    return;
  }

  const keys = headers.length > 0 ? headers.map(h => h.key) : Object.keys(data[0]);
  const headerLabels = headers.length > 0 ? headers.map(h => h.label) : keys;

  const csvRows = [];
  csvRows.push(headerLabels.map(label => `"${String(label).replace(/"/g, '""')}"`).join(","));

  for (const item of data) {
    const rowValues = keys.map(key => {
      let val = item[key];
      if (Array.isArray(val)) {
        val = val.join("; ");
      } else if (typeof val === 'object' && val !== null) {
        val = JSON.stringify(val);
      }
      return `"${String(val ?? "").replace(/"/g, '""')}"`;
    });
    csvRows.push(rowValues.join(","));
  }

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
