import type { Metadata } from "next";
import "./globals.css";

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
