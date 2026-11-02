import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const privatePaths = ["/api/", "/dashboard", "/chat", "/login", "/register", "/listings/new"];

const aiAgents = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Google-Extended",
  "PerplexityBot",
  "Bingbot",
  "Applebot",
  "Applebot-Extended",
  "DuckAssistBot",
  "meta-externalagent",
  "FacebookBot",
  "Amazonbot",
  "Bytespider",
  "CCBot",
  "anthropic-ai",
  "cohere-ai",
  "YouBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt", "/llms-full.txt"],
        disallow: privatePaths,
      },
      ...aiAgents.map((userAgent) => ({
        userAgent,
        allow: ["/", "/llms.txt", "/llms-full.txt"],
        disallow: ["/api/", "/dashboard", "/chat", "/login", "/register"],
      })),
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/feed.xml`],
    host: SITE_URL,
  };
}
