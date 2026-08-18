import type { Metadata, Viewport } from "next";
import "./globals.css";

// Reinforces the Vercel function region alongside vercel.json, so pages
// run physically close to the Supabase database (ap-south-1 / Mumbai)
// for lower latency on every request.
export const preferredRegion = "bom1";

export const metadata: Metadata = {
  metadataBase: new URL("https://sierrabad.vercel.app"),
  title: "SierraBad | ระบบบริหารจัดการก๊วนแบดมืออาชีพ",
  description:
    "แพลตฟอร์มบริหารจัดการก๊วนแบดมินตันครบวงจร จัดก๊วน เช็คอิน จับคู่เกมส์ คิดค่าลูก-ค่าสนาม และแจ้งเตือนสรุปผลอัตโนมัติเข้า LINE OA โดย SierraBad",
  openGraph: {
    title: "SierraBad | ระบบบริหารจัดการก๊วนแบดมืออาชีพ",
    description: "แพลตฟอร์มบริหารจัดการก๊วนแบดมินตันครบวงจร โดย SierraBad",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SierraBad",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SierraBad",
  },
};

export const viewport: Viewport = {
  themeColor: "#7C3AED",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
