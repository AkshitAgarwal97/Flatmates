import path from "path";

/** Persistent data root. On Vercel this is /tmp; on a VM use env FLATMATE_DATA_DIR. */
export function dataDir() {
  const override = process.env.FLATMATES_DATA_DIR?.trim();
  if (override) return override;
  if (process.env.VERCEL) return path.join("/tmp", "flatmates-data");
  return path.join(process.cwd(), "data");
}
