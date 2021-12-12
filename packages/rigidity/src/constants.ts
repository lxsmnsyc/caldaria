// Directory relative to project root where all pages are located
export const PAGES_PATH = 'src/pages';

// Directory relative to project root where api files are located
export const API_PATH = 'src/api';

// Directory relative to project root where public files are located
export const PUBLIC_PATH = 'src/public';

export const DOCUMENT_ERROR_DATA = 'rigidity_error';

// Name of the app root
export const DOCUMENT_MAIN_ROOT = 'rigidity__root';

// Base URL path for static file serving
export const STATIC_PATH = '_rigidity';

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
