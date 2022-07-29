# ![rigidity](https://github.com/LXSMNSYC/rigidity/blob/main/images/banner.png?raw=true)

## 🚧 UNDER DEVELOPMENT 🚧

## Install

```bash
npm install rigidity solid-js
npm install --dev postcss
```

```bash
yarn add rigidity solid-js
yarn add -D postcss
```

```bash
pnpm add rigidity solid-js
pnpm add -D postcss
```

## Usage

### Project structure

`rigidity` projects has a common file structure:

- `.rigidity` - This is the directory where the build output (both server and client) goes.
- `src` - The project's main directory.
  - `pages` - Directory where the pages are located. The structure of this directory is used for building the page router.
  - `api` - Directory where the API routes are located. Like `pages`, the structure of this directory is used for building the API router.
  - `public` - Directory for static files. Used by builds with static file serving support.

### Creating a build

`rigidity` does not have a CLI, however, it exposes an API for building the project. `rigidity` uses [ESBuild](https://esbuild.github.io/) for blazing-fast build times.

```js
const rigidity = require('rigidity');

rigidity.createBuild({});
```

You can run this file (e.g. `node build.js`) and this must be located on the root of the working directory. This will build the files from `src` and output it to `.rigidity`. `createBuild` can accept options to customize your build.

If you want to run a dev server with hot reload, you can use `createDevBuild`. `createDevBuild` requires the HTTP adapter to serve.

```js
const rigidity = require('rigidity');
const httpAdapter = require('rigidity-adapter-http').default;

rigidity.createDevBuild({
  adapter: httpAdapter,
});
```

You can possibly combine them

```js
const rigidity = require('rigidity');
const httpAdapter = require('rigidity-adapter-http').default;

if (process.env.NODE_ENV === 'development') {
  rigidity.createDevBuild({
    adapter: httpAdapter,
  });
} else {
  rigidity.createBuild({});
}
```
