// Directory relative to project root where all pages are located
export const PAGES_PATH = 'src/pages';

// Directory relative to project root where api files are located
export const API_PATH = 'src/api';

// Directory relative to project root where public files are located
export const PUBLIC_PATH = 'src/public';

export const DOCUMENT_DATA = 'caldaria__data';

// Name of the app root
export const DOCUMENT_MAIN_ROOT = 'caldaria__root';

// Base URL path for static file serving
export const ASSETS_URL = 'assets';
export const PUBLIC_URL = 'public';

export const API_URL = 'api';

export const PAGES_URL = 'pages';

// Directory output
export const BUILD_PATH = '.caldaria';

export const CUSTOM_ROOT = 'src/root';

export const DIRECTORY_ROOT = 'index';

export const SUPPORTED_PAGE_EXT = /* @__PURE__ */ new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  ...'md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron'.split('|').map((item) => `.${item}`),
]);

export const BUILD_OUTPUT = {
  client: {
    output: 'client',
    temp: 'tmp.client',
  },
  server: {
    output: 'server',
    temp: 'tmp.server',
  },
};

// Special search query for data-only fetching
export const RIGIDITY_DATA = '.caldaria-data';
export const RIGIDITY_ACTION = '.caldaria-action';

// Special headers
export const RIGIDITY_REDIRECT_HEADER = 'X-Caldaria-Redirect';

export const DEFAULT_WS_PORT = 12321;
