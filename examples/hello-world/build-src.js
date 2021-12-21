const rigidity = require('rigidity');

rigidity.createBuild({
  env: process.env.NODE_ENV,
  adapter: process.env.NODE_ENV === 'production' ? 'vercel' : 'http',
  ssrMode: 'async',
  esbuild: {
    tsconfig: './tsconfig.json',
  },
});
