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

// Custom app name
export const CUSTOM_APP = '_app';

// Custom document name
export const CUSTOM_DOCUMENT = '_document';

export const CUSTOM_404 = '_404';

export const CUSTOM_500 = '_500';

export const CUSTOM_ERROR = '_error';

export const DIRECTORY_ROOT = 'index';

export const RESERVED_PAGES = [
  CUSTOM_404,
  CUSTOM_500,
  CUSTOM_ERROR,
  CUSTOM_APP,
  CUSTOM_DOCUMENT,
];

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
