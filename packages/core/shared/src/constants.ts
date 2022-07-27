// Directory relative to project root where all pages are located
export const PAGES_PATH = 'src/pages';

// Directory relative to project root where api files are located
export const API_PATH = 'src/api';

// Directory relative to project root where public files are located
export const PUBLIC_PATH = 'src/public';

export const DOCUMENT_DATA = 'rigidity__data';

// Name of the app root
export const DOCUMENT_MAIN_ROOT = 'rigidity__root';

// Base URL path for static file serving
export const ASSETS_URL = 'assets';
export const PUBLIC_URL = 'public';

export const API_URL = 'api';

export const PAGES_URL = 'pages';

// Directory output
export const BUILD_PATH = '.rigidity';

export const CUSTOM_ROOT = 'src/root';

export const DIRECTORY_ROOT = 'index';

export const SUPPORTED_PAGE_EXT = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.solid',
  ...'md|mdx|markdown|mdown|mkdn|mkd|mkdown|ron'.split('|').map((item) => `.${item}`),
];

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
export const RIGIDITY_DATA = '.rigidity-data';
export const RIGIDITY_ACTION = '.rigidity-action';

// Special headers
export const RIGIDITY_REDIRECT_HEADER = 'X-Rigidity-Redirect';

export const DEFAULT_WS_PORT = 12321;
