import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-display", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], variable: "--f-body", display: "swap" });
const code = JetBrains_Mono({ subsets: ["latin"], variable: "--f-code", display: "swap" });

export const metadata: Metadata = {
  title: "RecallAI — Stop solving the same bug twice",
  description:
    "Save the problems you've solved and find them again by describing them in your own words. AI-powered semantic search for your developer memory.",
};

export const viewport: Viewport = { themeColor: "#0d0c12" };

/* Runs before paint so a saved light/system theme never flashes dark. */
const themeScript = `try{var t=localStorage.getItem("theme")||"dark";if(t==="light"||(t==="system"&&matchMedia("(prefers-color-scheme: light)").matches))document.documentElement.classList.add("light")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${code.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body className="min-h-dvh font-sans antialiased">
        {children}
        <Toaster position="bottom-right" theme="system" />
      </body>
    </html>
  );
}