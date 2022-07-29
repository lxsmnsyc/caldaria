# Root

## 🚧 UNDER DEVELOPMENT 🚧

A custom root allows lower-level override for building the app. This is useful when you want to provide your error pages, manage your document structure or implement your own app shell.

To create a custom root, you need to create a `src/root` file.

```js
// src/root.tsx
import { createRigidityRoot } from 'rigidity/root';

export default createRigidityRoot({});
```

## `App`

When switching between pages, old pages gets unmounted, which might not be preferrable specially if we have a state that's located in the components that we want to preserve or if the most of the page's layout is unchanging between navigations. By building a custom `App` component, this allows one to solve such problem.

```js
import { createRigidityRoot } from 'rigidity';

export default createRigidityRoot({
  App(props) {
    return (
      <AppLayout>
        {props.children}
      </AppLayout>
    );
  }
});
```

## `Document`

TODO

## `Error`, `Error404` and `Error500`

TODO

## `reportWebVitals`

TODO
