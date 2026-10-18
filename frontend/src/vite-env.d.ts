// Стили
/// <reference types="vite/client" />
declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

// Картинки
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.webp";
declare module "*.gif";
declare module "*.avif";

// SVG
declare module "*.svg" {
  import type { FunctionComponent, SVGProps } from "react";

  export const ReactComponent: FunctionComponent<
    SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}

// Только расширение, без ImportMeta
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_ENV: "local" | "production";
}
