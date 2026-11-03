function readHttpsUrl(value: string | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Public (browser-safe) configuration. Never put secrets here. */
export const publicConfig = {
  partyRockFlowUrl: readHttpsUrl(process.env.NEXT_PUBLIC_PARTYROCK_FLOW_URL),
  siteUrl: readHttpsUrl(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000",
  supabaseConfigured: Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ),
} as const;

/**
 * The persistence mode the app is running in. Supabase-backed persistence is a P1
 * milestone; until its repository is implemented the app always runs in demo mode,
 * even when Supabase variables are present.
 */
export type DataMode = "demo" | "supabase";
export const dataMode: DataMode = "demo";
