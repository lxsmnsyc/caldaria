const rigidity = require('rigidity');

rigidity.createBuild({
  env: 'production',
  adapter: 'vercel',
  ssrMode: 'async',
  esbuild: {
    tsconfig: './tsconfig.json',
  },
});
