const rigidity = require('rigidity/build');
const httpAdapter = require('rigidity-adapter-http').default;
const vercelAdapter = require('rigidity-adapter-vercel').default;

if (process.env.NODE_ENV === 'development') {
  rigidity.createDevBuild({
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
  rigidity.createBuild({
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
