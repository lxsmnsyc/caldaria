import { Plugin } from 'esbuild';

interface PostCSSOptions {
  dev: boolean;
}

export default function postcssPlugin(options: PostCSSOptions): Plugin {
  return {
    name: 'esbuild:postcss',

    setup(build) {
      build.onResolve({ filter: /\.module.css$/ }, async (args) => {
        const path = await import('path');
        return {
          path: path.join(args.resolveDir, args.path),
          namespace: 'postcss-modules',
        };
      });
      build.onResolve({ filter: /\.css$/ }, async (args) => {
        const path = await import('path');
        return {
          path: path.join(args.resolveDir, args.path),
          namespace: 'postcss',
        };
      });
      build.onLoad({ filter: /.*/, namespace: 'postcss' }, async (args) => {
        const fs = await import('fs/promises');
        const source = await fs.readFile(args.path, 'utf8');

        const postcss = await import('postcss');
        const postcssLoadConfig = await import('postcss-load-config');
        const postcssImport = await import('postcss-import');

        const config = await postcssLoadConfig.default({
          env: options.dev ? 'development' : 'production',
        });

        const processor = postcss.default(config.plugins);
        processor.use(postcssImport.default() as any);
        const result = await processor.process(source, config.options);

        return {
          contents: result.css,
          loader: 'css',
        };
      });

      build.onLoad({ filter: /.*/, namespace: 'postcss-modules' }, async (args) => {
        const fs = await import('fs/promises');
        const source = await fs.readFile(args.path, 'utf8');

        const postcss = await import('postcss');
        const postcssLoadConfig = await import('postcss-load-config');
        const postcssImport = await import('postcss-import');
        const postcssModules = await import('postcss-modules');

        const config = await postcssLoadConfig.default({
          env: options.dev ? 'development' : 'production',
        });

        const processor = postcss.default(config.plugins);
        processor.use(postcssModules.default({}));
        processor.use(postcssImport.default() as any);
        const result = await processor.process(source, config.options);

        return {
          contents: result.css,
          loader: 'css',
        };
      });
    },
  };
}
