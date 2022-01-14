const rigidity = require('rigidity');
const httpAdapter = require('rigidity-adapter-http').default;
const vercelAdapter = require('rigidity-adapter-vercel').default;

rigidity.createBuild({
  // env: process.env.NODE_ENV,
  // adapter: process.env.NODE_ENV === 'production' ? vercelAdapter : httpAdapter,
  env: 'development',
  adapter: httpAdapter,
  // ssrMode: 'node-stream',
  ssrMode: 'async',
  // ssrMode: 'sync',
  esbuild: {
    tsconfig: './tsconfig.json',
  },
});
