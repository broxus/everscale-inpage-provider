# Standalone Client

In this guide, we will walk you through the process of setting up and using the Standalone Client with the `everscale-inpage-provider`. The Standalone Client allows you to interact with TVM-compatible blockchains without requiring a browser extension or user interaction. This makes it ideal for server-side applications, situations where user interaction is not necessary, or when you need to switch between different TVM blockchains.

The Standalone Client provides a fallback option for the `everscale-inpage-provider`, which means that if no injected provider object is found (e.g., no browser extension is installed), the Standalone Client can be used as an alternative to interact with the blockchain.

The Standalone Client is available in two versions: one for the browser environment and another for Node.js.

::: info
For detailed guides on using the provider methods, interacting with the blockchain, and other advanced topics, please refer to the [Provider Guide](./../1-introduction.md){style="color:var(--vp-c-brand)"}. This guide provides comprehensive instructions and examples for each provider method and will help you make the most of the Standalone Client.
:::

::: warning Note
Please note that the Standalone Client requires an additional WebAssembly (`wasm`) file in the browser environment, which is about 1.3MB in size. Make sure to enable compression or be aware of your app's startup time.
:::
