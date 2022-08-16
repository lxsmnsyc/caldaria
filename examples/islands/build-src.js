const caldaria = require('caldaria/build');
const httpAdapter = require('caldaria-adapter-http').default;
const vercelAdapter = require('caldaria-adapter-vercel').default;

if (process.env.NODE_ENV === 'development') {
  caldaria.createDevBuild({
    mode: {
      type: 'islands',
    },
    env: 'development',
    adapter: httpAdapter,
    // env: 'development',
    // adapter: httpAdapter,
    // ssrMode: 'node-stream',
    ssrMode: 'async',
    // ssrMode: 'sync',
    esbuild: {
      tsconfig: './tsconfig.json',
    },
  });
} else {
  caldaria.createBuild({
    mode: {
      type: 'islands',
    },
    env: 'production',
    adapter: vercelAdapter,
    // env: 'development',
    // adapter: httpAdapter,
    // ssrMode: 'node-stream',
    ssrMode: 'async',
    // ssrMode: 'sync',
    esbuild: {
      tsconfig: './tsconfig.json',
    },
  });
}
