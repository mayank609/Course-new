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

async function uploadImage(file, folder = "skillup-hub") {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  const res = await fetch("/api/admin/upload-image", {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (res.status === 401) {
    window.location.href = "/admin/login.html";
    throw new Error("Not authenticated");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}

function wireImageUpload({ fileInputId, statusId, urlFieldName, form, folder }) {
  const fileInput = document.getElementById(fileInputId);
  const statusEl = document.getElementById(statusId);
  if (!fileInput) return;
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    if (!file) return;
    statusEl.textContent = "Uploading…";
    statusEl.style.color = "";
    try {
      const url = await uploadImage(file, folder);
      form.elements[urlFieldName].value = url;
      statusEl.textContent = "Uploaded ✓";
    } catch (err) {
      statusEl.textContent = `Upload failed: ${err.message}`;
      statusEl.style.color = "#dc2626";
    } finally {
      fileInput.value = "";
    }
  });
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

const DRIVE_ID_PATTERNS = [
  /drive\.google\.com\/file\/d\/([^/]+)/,
  /drive\.google\.com\/open\?id=([^&]+)/,
  /drive\.google\.com\/uc\?(?:export=\w+&)?id=([^&]+)/,
  /docs\.google\.com\/uc\?(?:export=\w+&)?id=([^&]+)/,
];

function toDirectImageUrl(url) {
  if (!url) return url;
  for (const pattern of DRIVE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match) return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600`;
  }
  return url;
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
