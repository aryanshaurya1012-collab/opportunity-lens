import type { Metadata } from "next";
import Link from "next/link";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page not found · OpportunityLens",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full items-center justify-center bg-background p-6">
        <main className="max-w-md space-y-4 text-center">
          <p className="text-sm font-medium text-brand">404</p>
          <h1 className="font-display text-4xl tracking-tight text-navy">This page doesn&apos;t exist.</h1>
          <p className="text-muted-foreground">
            The link may be broken, or the opportunity may have been removed.
          </p>
          <div className="flex justify-center gap-4 text-sm font-medium">
            <Link className="text-brand hover:underline" href="/">
              Go to homepage
            </Link>
            <Link className="text-brand hover:underline" href="/opportunities">
              Browse opportunities
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
