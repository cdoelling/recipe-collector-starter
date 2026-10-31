import path from "node:path";

export const DATA_DIR = path.join(process.cwd(), "data");
export const RECIPES_DIR = path.join(DATA_DIR, "recipes");
export const INBOX_DIR = path.join(DATA_DIR, "inbox");
export const CHECKS_DIR = path.join(DATA_DIR, "checks");
export const PANTRY_FILE = path.join(DATA_DIR, "pantry.json");
export const WEEK_FILE = path.join(DATA_DIR, "week.json");
export const KROGER_FILE = path.join(DATA_DIR, "kroger.json");
