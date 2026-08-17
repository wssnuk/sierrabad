import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sierrabad.vercel.app"),
  title: "ระบบบริหารจัดการก๊วนแบด | SierraBad",
  description:
    "แพลตฟอร์มบริหารจัดการก๊วนแบดมินตันครบวงจร จัดก๊วน เช็คอิน จับคู่เกมส์ คิดค่าลูก-ค่าสนาม และแจ้งเตือนสรุปผลอัตโนมัติเข้า LINE OA โดย SierraBad",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "ระบบบริหารจัดการก๊วนแบด | SierraBad",
    description: "แพลตฟอร์มบริหารจัดการก๊วนแบดมินตันครบวงจร โดย SierraBad",
    images: ["/logo.png"],
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
