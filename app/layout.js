import { Fredoka, Nunito_Sans } from "next/font/google";
import "./globals.css";

const display = Fredoka({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600"] });
const body = Nunito_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata = { robots: { index: false, follow: false, noarchive: true } };
export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
