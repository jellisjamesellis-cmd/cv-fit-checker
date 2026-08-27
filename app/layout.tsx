import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Fit Checker",
  description:
    "Paste a job description, upload your CV, and get a match score with tailoring advice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
