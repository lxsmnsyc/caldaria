# ![rigidity](https://github.com/LXSMNSYC/rigidity/blob/main/images/banner.png?raw=true)

## 🚧 UNDER DEVELOPMENT 🚧

## Install

```bash
npm install rigidity
```

```bash
yarn add rigidity
```

```bash
pnpm add rigidity
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

## Features

### SPA + SSR

`rigidity` utilizes Solid's blazing fast SSR capabilities while also maintaing the goodness of Single Page Applications. SolidJS offers 3 kinds of SSR: Sync, Async and Streaming, in which `rigidity` defaults to Async. You can pick your own SSR mode to build with using the `ssrMode` option for `createBuild`:

```js
rigidity.createBuild({
  ssrMode: 'async' // Other values: 'sync', 'node-stream', 'web-stream'
});
```

### File-based routing

Inspired by [Next.js' File-based Routing](https://nextjs.org/docs/routing/introduction), `rigidity` utilizes the same capability for building your app's pages. The pages, when directly accessed, are server-rendered and then hydrated on the client. Switching between pages on the client-side, `rigidity` opts-in to SPA to reduce the need for a server roundtrip, that is going into a full page reload. This way, app state is retained while navigating between pages.

#### Index routes

`pages/index.js` refers to the root of that route a.k.a. the home page. `index.js` can also be the root of that directory as it's home route (e.g. `pages/blog/index.js` refers to `/blog/`). Take note that `pages/blog/index.js` and `pages/blog.js` are two different pages, the former requiring a trailing slash (`/blog/` vs `/blog`).

Routes can also be nested, that is `pages/a/b/c/index.js` refers to `/a/b/c/`.

#### Dynamic routes

`pages/[id].js` refers to a dynamic route. `id` is captured as the key and the value in place of it will be used as the value for that key. You can use any kind of name for the key, and that will be used for the `params` object that will be passed to the page.

```js
// pages/[id].js

export default function Hello(props) {
  return <h1>{props.params.id}</h1>;
}
```

If there's nested dynamic routes i.e. `pages/[user]/blog/[id].js`, both will be added to the `params`:

```js
// pages/[user]/blog/[id].js
export default function Hello(props) {
  return (
    <>
      <UserInfo id={props.params.user} />
      <BlogPost id={props.params.id}> />
    </>
  );
}
```

#### Wildcard routes

For dynamically sized routes, you can use wildcard routes. Unlike dynamic routes, wildcard routes refers to `pages/[...ids].js` and the `params` value for `ids` refers to the array of string values captured in the route, i.e. `/a/b/c` -> `['a', 'b', 'c']`.

### Navigation and Page Linking

Using `<RouterLink>`, `rigidity` allows you to perform client-side routing between pages without losing the app state.

```js
import { RouterLink } from 'rigidity';

export default function Home() {
  return (
    <nav>
      <li><RouterLink href="/">Home</RouterLink></li>
      <li><RouterLink href="/about">About</RouterLink></li>
      <li><RouterLink href="/contact">Contact Us</RouterLink></li>
    </nav>
  );
}
```

### Data Loaders

`createResource` may be convenient for performing data fetching however there are sometimes that we might want to utilize some server-side code, for instance, performing DB queries, which `createResource` isn't suitable for. Data loaders allows pages to perform server-side data fetching.

By declaring `load` to the pages' component, `rigidity` runs the function on server-side before the app is server-rendered. `load` receives a [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object and the `params` that was parsed from the route.

```js
// pages/user/[id].js
import { isServer } from 'solid-js';

function UserProfile(props) {
  return <UserDetails data={props.data.load.details} />;
}

if (isServer) {
  UserProfile.load = async function (request, params) {
    return await Users.queryById(params.id);
  };
}

export default UserProfile;
```

`load` is only used on server-side and never on the client-side. When navigating to another page on client-side, `rigidity`'s client performs a data-only request to the page's route, that is, only `load` is evaluated and the SSR never takes place. This way, the client never opts-out of SPA while still staying true to the benefits of on-demand SSR.

### Actions and `<Form>`

TODO

### Custom App

When switching between pages, old pages gets unmounted, which might not be preferrable specially if we have a state that's located in the components that we want to preserve or if the most of the page's layout is unchanging between navigations. By building a custom `App` component, this allows one to solve such problem.

```js
// pages/_app.js
export default function App(props) {
  return (
    <AppLayout>
      {props.children}
    </AppLayout>
  );
}
```

`_app` must only be located in the root of `pages`.

### Custom Document

TODO

### Custom Error Pages

TODO

### Static File Serving

TODO

### API Routes

TODO

### SEO

TODO

### ESBuild

TODO

### `babel-plugin-solid-sfc`

TODO

### `babel-plugin-solid-labels`

TODO

### Markdown/MDX

### Imports

TODO

#### PostCSS

TODO

#### CSS Modules

TODO

#### Raw

TODO

#### URL

TODO

#### Asset

TODO

#### JSON

TODO

#### Text

TODO

### Web Vitals

TODO

### Custom Builds

TODO

## Deployment

TODO

### Serverful

TODO

### Vanilla

TODO

### Vercel

TODO

### Workers

TODO

## Upcoming Features

- Sass/SCSS support
- Less support
- Stylus support
- Worker imports
- WASM imports

## License

MIT © [lxsmnsyc](https://github.com/lxsmnsyc)