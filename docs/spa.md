# Single-Page Application and SSR

## 🚧 UNDER DEVELOPMENT 🚧

`caldaria` utilizes Solid's blazing fast SSR capabilities while also maintaing the goodness of Single Page Applications. SolidJS offers 3 kinds of SSR: Sync, Async and Streaming, in which `caldaria` defaults to Async. You can pick your own SSR mode to build with using the `ssrMode` option for `createBuild`:

```js
caldaria.createBuild({
  ssrMode: 'async' // Other values: 'sync', 'node-stream', 'web-stream'
});
```
