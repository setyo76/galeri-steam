import Image from "next/image";
import Gallery from "./Gallery";
import { listFiles, photoUrl, videoUrl, cleanName } from "../lib/drive";

export const revalidate = 300;

const TITLE = "Belajar STEAM Bersama Kakak SMP OeL BSD";
const DESC = "Dokumentasi siswa SD belajar STEAM dengan Stickem bersama kakak kelas SMP Kristen Ora et Labora BSD.";
const dev = process.env.NODE_ENV === "development";

export async function generateMetadata() {
  const { files } = await listFiles(process.env.PHOTO_FOLDER_ID, "image");
  const cover = files?.[0] ? photoUrl(files[0].id, 1200) : null;
  return {
    title: TITLE,
    description: DESC,
    robots: { index: false, follow: false, noarchive: true },
    openGraph: { title: TITLE, description: DESC, type: "website", locale: "id_ID", images: cover ? [cover] : [] },
  };
}

function Note({ text, error }) {
  return (
    <p className="note">
      {text}
      {dev && error ? <small>Info pengembang: {error}</small> : null}
    </p>
  );
}

export default async function Page() {
  const [photos, videos] = await Promise.all([
    listFiles(process.env.PHOTO_FOLDER_ID, "image"),
    listFiles(process.env.VIDEO_FOLDER_ID, "video"),
  ]);

  return (
    <>
      <header className="top">
        <div className="top-in">
          <Image src="/logo-oel.png" alt="Logo Ora et Labora" width={480} height={0} className="logo" priority style={{ height: "auto" }} />
          <div>
            <h1>{TITLE}</h1>
            <p>Kegembiraan Adik-adik SD belajar STEAM bersama Kakak-kakak SMP yang keren-keren.</p>
          </div>
        </div>
      </header>

      <main>
        <section aria-labelledby="h-foto">
          <h2 id="h-foto" className="h yellow">Foto kegiatan</h2>
          {photos.files === null ? (
            <Note text="Foto belum bisa dimuat. Muat ulang halaman beberapa saat lagi." error={photos.error} />
          ) : photos.files.length === 0 ? (
            <Note text="Belum ada foto di folder." />
          ) : (
            <Gallery photos={photos.files.map((p) => ({ src: photoUrl(p.id), alt: cleanName(p.name) }))} />
          )}
        </section>

        <section aria-labelledby="h-video" className="videos">
          <h2 id="h-video" className="h red">Video kegiatan</h2>
          {videos.files === null ? (
            <Note text="Video belum bisa dimuat. Muat ulang halaman beberapa saat lagi." error={videos.error} />
          ) : videos.files.length === 0 ? (
            <Note text="Belum ada video di folder." />
          ) : (
            <div className="grid">
              {videos.files.map((v) => (
                <figure key={v.id}>
                  <div className="frame">
                    <iframe src={videoUrl(v.id)} title={cleanName(v.name)} loading="lazy" allow="fullscreen" allowFullScreen />
                  </div>
                  <figcaption>{cleanName(v.name)}</figcaption>
                </figure>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        <div>SMP Kristen Ora et Labora BSD</div>
      </footer>
    </>
  );
}
