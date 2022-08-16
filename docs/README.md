# ![caldaria](https://github.com/LXSMNSYC/caldaria/blob/main/images/banner.png?raw=true)

## 🚧 UNDER DEVELOPMENT 🚧

## Install

```bash
npm install caldaria solid-js
npm install --dev postcss
```

```bash
yarn add caldaria solid-js
yarn add -D postcss
```

```bash
pnpm add caldaria solid-js
pnpm add -D postcss
```

## Usage

### Project structure

`caldaria` projects has a common file structure:

- `.caldaria` - This is the directory where the build output (both server and client) goes.
- `src` - The project's main directory.
  - `pages` - Directory where the pages are located. The structure of this directory is used for building the page router.
  - `api` - Directory where the API routes are located. Like `pages`, the structure of this directory is used for building the API router.
  - `public` - Directory for static files. Used by builds with static file serving support.

### Creating a build

`caldaria` does not have a CLI, however, it exposes an API for building the project. `caldaria` uses [ESBuild](https://esbuild.github.io/) for blazing-fast build times.

```js
const caldaria = require('caldaria');

caldaria.createBuild({});
```

You can run this file (e.g. `node build.js`) and this must be located on the root of the working directory. This will build the files from `src` and output it to `.caldaria`. `createBuild` can accept options to customize your build.

If you want to run a dev server with hot reload, you can use `createDevBuild`. `createDevBuild` requires the HTTP adapter to serve.

```js
const caldaria = require('caldaria');
const httpAdapter = require('caldaria-adapter-http').default;

caldaria.createDevBuild({
  adapter: httpAdapter,
});
```

You can possibly combine them

```js
const caldaria = require('caldaria');
const httpAdapter = require('caldaria-adapter-http').default;

if (process.env.NODE_ENV === 'development') {
  caldaria.createDevBuild({
    adapter: httpAdapter,
  });
} else {
  caldaria.createBuild({});
}
```
