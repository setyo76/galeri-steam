// Membaca isi folder Google Drive (folder harus "Siapa saja yang memiliki link").
// Jalur utama: Drive API (perlu DRIVE_API_KEY). Jalur cadangan: tampilan folder tersemat Drive (tanpa API key).
const EXT = {
  image: /\.(jpe?g|png|webp|gif|heic|heif|avif)$/i,
  video: /\.(mp4|mov|m4v|webm|avi|mkv|3gp)$/i,
};
const byName = (a, b) => a.name.localeCompare(b.name, "id", { numeric: true });

async function viaApi(folderId, kind) {
  const key = process.env.DRIVE_API_KEY;
  if (!key) throw new Error("DRIVE_API_KEY belum terbaca (cek .env.local, lalu restart npm run dev)");
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const url =
    `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=name&pageSize=100` +
    `&fields=files(id,name,mimeType)&key=${key}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Drive API ${res.status}: ${data?.error?.message || "gagal"}`);
  return (data.files || []).filter((f) => f.mimeType.startsWith(kind + "/"));
}

async function viaEmbed(folderId, kind) {
  const res = await fetch(`https://drive.google.com/embeddedfolderview?id=${folderId}`, {
    next: { revalidate: 300 },
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) throw new Error(`Tampilan folder ${res.status}`);
  const html = await res.text();
  const re = /id="entry-([\w-]+)"[\s\S]*?class="flip-entry-title">([^<]*)</g;
  const files = [];
  let m;
  while ((m = re.exec(html))) {
    const name = m[2].replace(/&amp;/g, "&").replace(/&#39;/g, "'");
    if (EXT[kind].test(name)) files.push({ id: m[1], name });
  }
  return files.sort(byName);
}

// kind: "image" atau "video". Hasil: { files } atau { files: null, error }
export async function listFiles(folderId, kind) {
  if (!folderId) return { files: null, error: "ID folder belum diisi" };
  try {
    return { files: await viaApi(folderId, kind) };
  } catch (e1) {
    console.error("[drive] jalur API gagal:", e1.message);
    try {
      return { files: await viaEmbed(folderId, kind) };
    } catch (e2) {
      console.error("[drive] jalur cadangan gagal:", e2.message);
      return { files: null, error: `${e1.message} | ${e2.message}` };
    }
  }
}

export const photoUrl = (id, w = 1600) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;
export const videoUrl = (id) => `https://drive.google.com/file/d/${id}/preview`;
export const cleanName = (name) =>
  name.replace(/\.[^.]+$/, "").replace(/^\d+[_\-\s]*/, "").replace(/_+/g, " ").trim();
