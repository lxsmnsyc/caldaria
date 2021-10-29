export const PAGES_PATH = 'pages';

export const DOCUMENT_MAIN_ROOT = 'rigidity__root';

export const STATIC_PATH = '_rigidity';

export const API_PATH = 'api';

export const PUBLIC_PATH = 'public';

export const BUILD_PATH = '.rigidity';

export const CUSTOM_APP = '_app';

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
