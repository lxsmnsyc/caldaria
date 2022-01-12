const rigidity = require('rigidity');

rigidity.createBuild({
  // env: process.env.NODE_ENV,
  // adapter: process.env.NODE_ENV === 'production' ? 'vercel' : 'http',
  env: 'development',
  adapter: 'http',
  ssrMode: 'node-stream',
  // ssrMode: 'async',
  // ssrMode: 'sync',
  esbuild: {
    tsconfig: './tsconfig.json',
  },
});
