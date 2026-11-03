import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontVariables } from "@/lib/fonts";
import { baseMetadata } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = { ...baseMetadata, robots: { index: false } };

export default function ProductRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontVariables} dark h-full antialiased`}>
      <body className="min-h-full bg-background">
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </body>
    </html>
  );
}
