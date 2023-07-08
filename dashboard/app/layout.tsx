import Nav from "@/components/Nav";
import "./globals.css";

import { Suspense } from "react";

export const metadata = {
  title: "カフェテリアルネ",
  description: "ICFPC 2023",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
        <Suspense>
          <Nav />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
