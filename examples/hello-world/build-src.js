const rigidity = require('rigidity');

rigidity.createBuild({
  env: 'development',
  adapter: 'vercel',
  ssrMode: 'async',
  esbuild: {
    tsconfig: './tsconfig.json',
  },
});
