import { defineConfig } from "vitest/config";
import { resolve } from "path";
import Sitemap from "vite-plugin-sitemap";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    Sitemap({
      hostname: "https://itsw.ru",
      dynamicRoutes: ["/shop", "/about", "/login", "/register"],
      changefreq: {
        "/": "daily",
        "/shop": "daily",
        "/about": "monthly",
        "/login": "yearly",
        "/register": "yearly",
      },
      priority: {
        "/": 1.0,
        "/shop": 0.9,
        "/about": 0.5,
        "/login": 0.3,
        "/register": 0.3,
      },
      generateRobotsTxt: true,
      robots: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
        },
        // Google
        {
          userAgent: "Googlebot",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
        },
        {
          userAgent: "Googlebot-News",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
        },
        {
          userAgent: "Googlebot-Image",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
        },
        {
          userAgent: "Googlebot-Video",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
        },
        {
          userAgent: "Mediapartners-Google",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
        },
        {
          userAgent: "AdsBot-Google",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
        },
        // Yandex
        {
          userAgent: "YandexBot",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
          cleanParam: "utm_source&utm_medium&utm_campaign&utm_term&utm_content",
        },
        {
          userAgent: "YandexImages",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
        },
        {
          userAgent: "YandexMetrika",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
        },
        {
          userAgent: "YandexTurbo",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
        },
        {
          userAgent: "YandexMobileBot",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
        },
        {
          userAgent: "YandexAccessibilityBot",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
        },
        {
          userAgent: "YandexAdditional",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
        },
        {
          userAgent: "YandexAdditionalBot",
          allow: "/",
          disallow: ["/admin/", "/profile/", "/api/"],
        },
      ],
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});
