import type { Metadata } from "next";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CV Fit Checker",
  description:
    "Paste a job description, upload your CV, and get a match score with tailoring advice.",
};

// Avoid static prerender of Clerk UI during `next build` when env keys are absent
// (e.g. Vercel Preview before secrets are configured).
export const dynamic = "force-dynamic";

function clerkPublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    process.env.CLERK_PUBLISHABLE_KEY ||
    ""
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = clerkPublishableKey();

  if (!publishableKey) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
          <main className="mx-auto max-w-xl px-4 py-16">
            <h1 className="text-xl font-semibold">Clerk is not configured</h1>
            <p className="mt-3 text-sm text-slate-600">
              Add{" "}
              <code className="rounded bg-slate-200 px-1">
                NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
              </code>{" "}
              and{" "}
              <code className="rounded bg-slate-200 px-1">CLERK_SECRET_KEY</code>{" "}
              in the Vercel project environment variables (Preview and
              Production), then redeploy.
            </p>
          </main>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en">
        <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <nav className="flex items-center gap-4 text-sm">
                <Link
                  href="/"
                  className="font-semibold tracking-tight text-slate-900"
                >
                  CV Fit Checker
                </Link>
                <SignedIn>
                  <Link
                    href="/history"
                    className="text-slate-600 hover:text-slate-900"
                  >
                    History
                  </Link>
                </SignedIn>
              </nav>
              <div className="flex items-center gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800"
                    >
                      Sign in
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
              </div>
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
