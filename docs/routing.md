# Routing

## 🚧 UNDER DEVELOPMENT 🚧

## File-based routing

Inspired by [Next.js' File-based Routing](https://nextjs.org/docs/routing/introduction), `caldaria` utilizes the same capability for building your app's pages. The pages, when directly accessed, are server-rendered and then hydrated on the client. Switching between pages on the client-side, `caldaria` opts-in to SPA to reduce the need for a server roundtrip, that is going into a full page reload. This way, app state is retained while navigating between pages.

### Index routes

`pages/index.js` refers to the root of that route a.k.a. the home page. `index.js` can also be the root of that directory as it's home route (e.g. `pages/blog/index.js` refers to `/blog/`). Take note that `pages/blog/index.js` and `pages/blog.js` are two different pages, the former requiring a trailing slash (`/blog/` vs `/blog`).

Routes can also be nested, that is `pages/a/b/c/index.js` refers to `/a/b/c/`.

### Dynamic routes

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

### Wildcard routes

For dynamically sized routes, you can use wildcard routes. Unlike dynamic routes, wildcard routes refers to `pages/[...ids].js` and the `params` value for `ids` refers to the array of string values captured in the route, i.e. `/a/b/c` -> `['a', 'b', 'c']`.

## Navigation and Page Linking

Using `<RouterLink>`, `caldaria` allows you to perform client-side routing between pages without losing the app state.

```js
import { RouterLink } from 'caldaria';

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

## Data Loaders

`createResource` may be convenient for performing data fetching however there are sometimes that we might want to utilize some server-side code, for instance, performing DB queries, which `createResource` isn't suitable for. Data loaders allows pages to perform server-side data fetching.

By declaring `load` to the pages' component, `caldaria` runs the function on server-side before the app is server-rendered. `load` receives a [`Request`](https://developer.mozilla.org/en-US/docs/Web/API/Request) object and the `params` that was parsed from the route.

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

`load` is only used on server-side and never on the client-side. When navigating to another page on client-side, `caldaria`'s client performs a data-only request to the page's route, that is, only `load` is evaluated and the SSR never takes place. This way, the client never opts-out of SPA while still staying true to the benefits of on-demand SSR.

## Actions and `<Form>`

TODO

## API Routes

TODO
