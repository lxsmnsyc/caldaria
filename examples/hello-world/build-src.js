const rigidity = require('rigidity');

rigidity.createBuild({
  env: 'development',
  ssrMode: 'async',
  esbuild: {
    tsconfig: './tsconfig.json',
  },
});
