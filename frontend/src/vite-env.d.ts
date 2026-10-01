// Стили
declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Картинки
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.webp';
declare module '*.gif';
declare module '*.avif';

// SVG — исправленный вариант без require
declare module '*.svg' {
  import type { FunctionComponent, SVGProps } from 'react';

  export const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement> & { title?: string }>;
  const src: string;
  export default src;
}