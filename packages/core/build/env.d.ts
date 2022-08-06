/// <reference types="babel-plugin-solid-sfc" />
/// <reference types="babel-plugin-solid-labels" />
/// <reference types="solid-marked" />

// images
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.gif' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
declare module '*.ico' {
  const src: string;
  export default src;
}
declare module '*.webp' {
  const src: string;
  export default src;
}
declare module '*.avif' {
  const src: string;
  export default src;
}

// media
declare module '*.mp4' {
  const src: string;
  export default src;
}
declare module '*.webm' {
  const src: string;
  export default src;
}
declare module '*.ogg' {
  const src: string;
  export default src;
}
declare module '*.mp3' {
  const src: string;
  export default src;
}
declare module '*.wav' {
  const src: string;
  export default src;
}
declare module '*.flac' {
  const src: string;
  export default src;
}
declare module '*.aac' {
  const src: string;
  export default src;
}

// fonts
declare module '*.woff' {
  const src: string;
  export default src;
}
declare module '*.woff2' {
  const src: string;
  export default src;
}
declare module '*.eot' {
  const src: string;
  export default src;
}
declare module '*.ttf' {
  const src: string;
  export default src;
}
declare module '*.otf' {
  const src: string;
  export default src;
}

// CSS

interface CSSModule {
  [key: string]: string;
}

declare module '*.module.css?url-only' {
  const contents: string;
  export default contents;
}

declare module '*.module.css?url' {
  export const styles: CSSModule;
  export const source: string;
}

declare module '*.module.css?raw' {
  export const styles: CSSModule;
  export const sheet: string;
}

declare module '*.module.css' {
  const contents: CSSModule;
  export default contents;
}

declare module '*.css?url' {
  const contents: string;
  export default contents;
}

declare module '*.css?raw' {
  const contents: string;
  export default contents;
}

declare module '*.css' {
  // no-op
}

// Less
declare module '*.less?url' {
  const contents: string;
  export default contents;
}

declare module '*.less?raw' {
  const contents: string;
  export default contents;
}

declare module '*.less' {
  // no-op
}

// Sass
declare module '*.scss?url' {
  const contents: string;
  export default contents;
}

declare module '*.scss?raw' {
  const contents: string;
  export default contents;
}

declare module '*.scss' {
  // no-op
}
declare module '*.sass?url' {
  const contents: string;
  export default contents;
}

declare module '*.sass?raw' {
  const contents: string;
  export default contents;
}

declare module '*.sass' {
  // no-op
}

// Stylus

declare module '*.styl?url' {
  const contents: string;
  export default contents;
}

declare module '*.styl?raw' {
  const contents: string;
  export default contents;
}

declare module '*.styl' {
  // no-op
}

// queries
declare module '*?raw' {
  const contents: string;
  export default contents;
}

declare module '*?url' {
  const contents: string;
  export default contents;
}

// JSON
declare module '*.json' {
  type JSON =
    | boolean
    | number
    | string
    | null
    | JSON[]
    | { [key: string]: JSON };

  const data: JSON;
  export default data;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface ImportMetaEnv {
  [key: string]: any
  MODE: string
  DEV: boolean
  PROD: boolean
}
