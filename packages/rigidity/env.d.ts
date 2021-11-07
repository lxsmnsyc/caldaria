/// <reference types="babel-plugin-solid-labels" />

// queries
declare module '*?raw' {
  const contents: string;
  export default contents;
}

declare module '*?url' {
  const contents: string;
  export default contents;
}

// images

// images
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.jpeg' {
  const src: string
  export default src
}
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.gif' {
  const src: string
  export default src
}
declare module '*.svg' {
  const src: string
  export default src
}
declare module '*.ico' {
  const src: string
  export default src
}
declare module '*.webp' {
  const src: string
  export default src
}
declare module '*.avif' {
  const src: string
  export default src
}


// media
declare module '*.mp4' {
  const src: string
  export default src
}
declare module '*.webm' {
  const src: string
  export default src
}
declare module '*.ogg' {
  const src: string
  export default src
}
declare module '*.mp3' {
  const src: string
  export default src
}
declare module '*.wav' {
  const src: string
  export default src
}
declare module '*.flac' {
  const src: string
  export default src
}
declare module '*.aac' {
  const src: string
  export default src
}


// fonts
declare module '*.woff' {
  const src: string
  export default src
}
declare module '*.woff2' {
  const src: string
  export default src
}
declare module '*.eot' {
  const src: string
  export default src
}
declare module '*.ttf' {
  const src: string
  export default src
}
declare module '*.otf' {
  const src: string
  export default src
}

// CSS

interface CSSModule {
  [key: string]: string;
}

declare module '*.module.css' {
  const contents: CSSModule;
  export default contents;
}

declare module '*.css' {
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