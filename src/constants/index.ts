import { env } from "@/env"

export const APP_CONFIG = {
  GITHUB_URL: "https://github.com/zehan12/tools",
  INSPIRED_BY_URL: env.VITE_INSPIRED_BY_URL,
  AUTHOR_NAME: "zehan12",
  APP_NAME: "Developer Tools",
} as const;

export const STORAGE_KEYS = {
  THEME: "tools-ui-theme",
} as const;
