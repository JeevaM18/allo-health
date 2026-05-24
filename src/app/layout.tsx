import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Allo Inventory - Next-Gen Stock Lock Experience",
  description: "Atomically lock stock, manage warehousing, and release expired reservations under extreme concurrency.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full bg-[#070a13] text-[#F3F4F6] flex flex-col font-sans selection:bg-purple-600/30 selection:text-purple-300">
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0d1326",
              color: "#F3F4F6",
              border: "1px solid #1f293d",
              borderRadius: "0.75rem",
            },
            success: {
              iconTheme: {
                primary: "#A78BFA",
                secondary: "#0d1326",
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
