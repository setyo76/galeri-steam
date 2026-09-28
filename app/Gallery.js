"use client";
import { useEffect, useRef, useState } from "react";

const INTERVAL = 4000;
const MAX_DOTS = 12;

export default function Gallery({ photos }) {
  const [i, setI] = useState(0);
  const [userPaused, setUserPaused] = useState(false); // dari tombol Jeda / Putar otomatis
  const [hover, setHover] = useState(false); // jeda sementara saat kursor di atas galeri atau layar disentuh
  const touchTimer = useRef(null);
  const n = photos.length;

  // Pengguna yang mengaktifkan "kurangi gerakan" mulai dalam keadaan jeda; tombol tetap bisa memutar.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setUserPaused(true);
  }, []);

  useEffect(() => {
    if (userPaused || hover || n < 2) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), INTERVAL);
    return () => clearTimeout(t);
  }, [userPaused, hover, n, i]);

  useEffect(() => () => clearTimeout(touchTimer.current), []);

  const go = (d) => setI((x) => (x + d + n) % n);

  return (
    <div
      className="carousel"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
      onTouchStart={() => {
        clearTimeout(touchTimer.current);
        setHover(true);
      }}
      onTouchEnd={() => {
        touchTimer.current = setTimeout(() => setHover(false), 6000);
      }}
    >
      <div className="stage" aria-live="off">
        {photos.map((p, k) => (
          <img
            key={p.src}
            src={p.src}
            alt={p.alt}
            className={k === i ? "on" : ""}
            loading={Math.abs(k - i) <= 1 ? "eager" : "lazy"}
            referrerPolicy="no-referrer"
          />
        ))}
        {n > 1 && (
          <>
            <button className="nav prev" onClick={() => go(-1)} aria-label="Foto sebelumnya">‹</button>
            <button className="nav next" onClick={() => go(1)} aria-label="Foto berikutnya">›</button>
          </>
        )}
      </div>
      <div className="bar">
        <span className="count">{i + 1} dari {n}</span>
        {n <= MAX_DOTS ? (
          <div className="dots">
            {photos.map((_, k) => (
              <button key={k} className={k === i ? "dot on" : "dot"} onClick={() => setI(k)} aria-label={`Foto ${k + 1}`} />
            ))}
          </div>
        ) : (
          <div className="track" role="presentation"><span style={{ width: `${((i + 1) / n) * 100}%` }} /></div>
        )}
        {n > 1 && (
          <button className="toggle" onClick={() => setUserPaused((p) => !p)} aria-pressed={userPaused}>
            {userPaused ? "Putar otomatis" : "Jeda"}
          </button>
        )}
      </div>
    </div>
  );
}
