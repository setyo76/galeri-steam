// Membaca isi folder Google Drive lewat Drive API (folder harus "Siapa saja yang memiliki link").
// Mode utama: ROOT_FOLDER_ID = folder induk. Tiap subfolder menjadi satu album, dan album baru muncul otomatis.
// Subfolder berawalan "Foto " atau "Video " dengan topik yang sama digabung (mis. "Foto Belajar STEAM" + "Video Belajar STEAM").
// Mode lama (cadangan): jika ROOT_FOLDER_ID kosong, memakai PHOTO_FOLDER_ID dan VIDEO_FOLDER_ID.
const FOLDER = "application/vnd.google-apps.folder";
const natural = (a, b) => a.name.localeCompare(b.name, "id", { numeric: true });

async function list(folderId) {
  const key = process.env.DRIVE_API_KEY;
  if (!key) throw new Error("DRIVE_API_KEY belum terbaca (cek .env.local, lalu restart npm run dev)");
  const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
  const url =
    `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=name&pageSize=1000` +
    `&fields=files(id,name,mimeType,videoMediaMetadata(width,height))&key=${key}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Drive API ${res.status}: ${data?.error?.message || "gagal"}`);
  return (data.files || []).sort(natural);
}

const photosOf = (files) => files.filter((f) => f.mimeType.startsWith("image/"));
const videosOf = (files) => files.filter((f) => f.mimeType.startsWith("video/"));

export const photoUrl = (id, w = 1600) => `https://drive.google.com/thumbnail?id=${id}&sz=w${w}`;
export const videoUrl = (id) => `https://drive.google.com/file/d/${id}/preview`;
export const cleanName = (name) =>
  name.replace(/\.[^.]+$/, "").replace(/^\d+[_\-\s]*/, "").replace(/_+/g, " ").trim();
const folderTitle = (name) => name.replace(/^\d+[_\-\s]*/, "").replace(/_+/g, " ").trim();
const topicOf = (name) => folderTitle(name).replace(/^(foto|video|photo)\s+/i, "").trim() || folderTitle(name);
export const slugOf = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "album";

// Hasil: { albums: [{ title, photos, videos }] } atau { albums: null, error }
export async function getAlbums() {
  try {
    const root = process.env.ROOT_FOLDER_ID;
    if (!root) {
      const [p, v] = await Promise.all([list(process.env.PHOTO_FOLDER_ID), list(process.env.VIDEO_FOLDER_ID)]);
      return { albums: [{ title: "Belajar STEAM", photos: photosOf(p), videos: videosOf(v) }] };
    }
    const items = await list(root);
    const folders = items.filter((f) => f.mimeType === FOLDER);
    const inside = await Promise.all(folders.map((f) => list(f.id)));

    const map = new Map();
    const add = (title, photos, videos) => {
      const k = title.toLowerCase();
      const a = map.get(k) || { title, photos: [], videos: [] };
      a.photos.push(...photos);
      a.videos.push(...videos);
      map.set(k, a);
    };
    folders.forEach((f, i) => add(topicOf(f.name), photosOf(inside[i]), videosOf(inside[i])));
    if (photosOf(items).length || videosOf(items).length) add("Dokumentasi lainnya", photosOf(items), videosOf(items));
    return { albums: [...map.values()].filter((a) => a.photos.length || a.videos.length) };
  } catch (e) {
    console.error("[drive]", e.message);
    return { albums: null, error: e.message };
  }
}
