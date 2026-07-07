import type { LazyExoticComponent, ComponentType } from "react";

export const Category = {
  Encoding: "encoding",
  Security: "security",
  CSS: "css",
  Text: "text",
  Dev: "dev",
  Finance: "finance",
} as const;
export type Category = typeof Category[keyof typeof Category];

export const Tools = {
  Color: "color",
  ColorCompare: "color-compare",
  Hmac: "hmac",
  Secrets: "secrets",
  Base64: "base64",
  Base64Encode: "base64-encode",
  JWT: "jwt",
  Diff: "diff",
  WordCounter: "word-counter",
  SqlFormatter: "sql-formatter",
  JsonFormatter: "json-formatter",
  NotificationTester: "notification-tester",
  SecretSharing: "secret-sharing",
  DnsRecords: "dns-records",
  TimezoneConverter: "timezone-converter",
  QrCode: "qr-code",
  IndiaIncomeTax: "india-income-tax",
  BountyCalculator: "bounty-calculator",
  CvssCalculator: "cvss-calculator",
  MarkdownViewer: "markdown-viewer",
  Whiteboard: "whiteboard",
  UrlEncoder: "url-encoder",
  CronGenerator: "cron-generator",
  RestClient: "rest-client",
  ColorPalette: "color-palette",
  ImageColorExtractor: "image-color-extractor",
} as const;
export type Tools = typeof Tools[keyof typeof Tools];

export interface ToolDef {
  slug: Tools;
  title: string;
  component: LazyExoticComponent<ComponentType<any>>;
  description: string;
  icon: string;
  category: Category;
}
