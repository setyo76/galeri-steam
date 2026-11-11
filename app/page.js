import Image from "next/image";
import Gallery from "./Gallery";
import { getAlbums, photoUrl, videoUrl, cleanName, slugOf } from "../lib/drive";

export const revalidate = 300;

// Ubah dua baris ini jika ingin judul yang berbeda
const TITLE = "Belajar Seru di SMP OeL BSD";
const SUB = "Dokumentasi kegiatan belajar di SMP Kristen Ora et Labora BSD, termasuk saat siswa SD belajar bersama kakak-kakak SMP.";
const DESC = "Dokumentasi kegiatan belajar siswa bersama kakak-kakak SMP Kristen Ora et Labora BSD: STEAM, IPA, dan lainnya.";
const ACCENTS = ["yellow", "red", "blue"];
const dev = process.env.NODE_ENV === "development";

export async function generateMetadata() {
  const { albums } = await getAlbums();
  const first = albums?.find((a) => a.photos.length)?.photos[0];
  const cover = first ? photoUrl(first.id, 1200) : null;
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

const count = (n, unit) => `${n} ${unit}`;

export default async function Page() {
  const { albums, error } = await getAlbums();

  return (
    <>
      <header className="top">
        <div className="top-in">
          <Image src="/logo-oel.png" alt="Logo Ora et Labora" width={480} height={0} className="logo" priority style={{ height: "auto" }} />
          <div>
            <h1>{TITLE}</h1>
            <p>{SUB}</p>
          </div>
        </div>
      </header>

      {albums && albums.length > 1 && (
        <nav className="chips" aria-label="Pilih album">
          {albums.map((a) => (
            <a key={a.title} href={`#${slugOf(a.title)}`}>{a.title}</a>
          ))}
        </nav>
      )}

      <main>
        {albums === null ? (
          <Note text="Dokumentasi belum bisa dimuat. Muat ulang halaman beberapa saat lagi." error={error} />
        ) : albums.length === 0 ? (
          <Note text="Belum ada dokumentasi." />
        ) : (
          albums.map((a, i) => {
            const meta = [a.photos.length ? count(a.photos.length, "foto") : null, a.videos.length ? count(a.videos.length, "video") : null]
              .filter(Boolean).join(" \u00B7 ");
            return (
              <section key={a.title} id={slugOf(a.title)} className="album" aria-labelledby={`h-${slugOf(a.title)}`}>
                <h2 id={`h-${slugOf(a.title)}`} className={`h ${ACCENTS[i % ACCENTS.length]}`}>{a.title}</h2>
                <p className="count">{meta}</p>
                {a.photos.length > 0 && (
                  <Gallery photos={a.photos.map((p) => ({ src: photoUrl(p.id), alt: cleanName(p.name) }))} />
                )}
                {a.videos.length > 0 && (
                  <div className="grid vids">
                    {a.videos.map((v) => {
                      const w = v.videoMediaMetadata?.width;
                      const h = v.videoMediaMetadata?.height;
                      const portrait = w && h && h > w;
                      return (
                        <figure key={v.id}>
                          <div
                            className={portrait ? "frame portrait" : "frame"}
                            style={w && h ? { aspectRatio: `${w} / ${h}` } : undefined}
                          >
                            <iframe src={videoUrl(v.id)} title={cleanName(v.name)} loading="lazy" allow="fullscreen" allowFullScreen />
                          </div>
                          <figcaption>
                            <span>{cleanName(v.name)}</span>
                            <a className="open" href={`https://drive.google.com/file/d/${v.id}/view`} target="_blank" rel="noopener noreferrer">Buka di Drive</a>
                          </figcaption>
                        </figure>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>

      <footer>
        <div>SMP Kristen Ora et Labora BSD</div>
      </footer>
    </>
  );
}
