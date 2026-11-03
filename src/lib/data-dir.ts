import path from "path";

/** Persistent data root. On the Oracle VM set FLATMATE_DATA_DIR=/var/lib/flatmates. */
export function dataDir() {
  const override = process.env.FLATMATES_DATA_DIR?.trim();
  if (override) return override;
  return path.join(process.cwd(), "data");
}
