import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "LedgerLens",
  description: "AI-powered finance case study platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen">
          {/* SideNav — ported from app.jsx */}
          <nav className="w-64 border-r bg-sidebar flex-shrink-0" />
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* TopBar — ported from app.jsx */}
            <header className="h-14 border-b flex-shrink-0" />
            <main className="flex-1 overflow-auto p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
