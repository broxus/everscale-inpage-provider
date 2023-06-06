---
outline: deep
---

<script setup>
import { ProviderRpcClient } from 'everscale-inpage-provider';
import { onMounted, onUnmounted, ref } from 'vue';

const provider = new ProviderRpcClient();

const providerState = ref();
const getProviderState = async () => {
  await provider.ensureInitialized();
  providerState.value = await provider.rawApi.getProviderState()
    .then((state) => JSON.stringify(state, undefined, 4));
};


const permissions = ref();

let permissionsSubscription = undefined;
onMounted(async () => {

  permissionsSubscription = await provider.subscribe('permissionsChanged');
  permissionsSubscription.on('data', data => {
    if (data.permissions.accountInteraction != null) {
      data.permissions.accountInteraction.address =
        data.permissions.accountInteraction.address.toString();
    }
    permissions.value = JSON.stringify(data, undefined, 4)
  });

});

onUnmounted(async () => {
  if (permissionsSubscription != null) {
    permissionsSubscription.unsubscribe();
  }
});

const requestPermissions = async () => {
  await provider.requestPermissions({
    permissions: ['basic', 'accountInteraction']
  });
};

const disconnect = async () => {
  await provider.disconnect()
};

const changeAccount = async () => {
  await provider.changeAccount()
};

</script>

# Quick Start

## Basic Setup

Depending on your use case, you can use different kinds of providers:

- **Extension only:**

  This default usage pattern requires injected provider object. This means extension must be
  installed or website is opened inside some webview with prepared runtime. Library will
  wait until this object is ready and will not require any other assets to load.

  <div class="language-sh"><pre><code><span class="line"><span style="color:var(--vp-c-brand);">&gt;</span> <span style="color:#A6ACCD;">npm install --save everscale-inpage-provider</span></span></code></pre></div>

  ```typescript
  import { ProviderRpcClient } from 'everscale-inpage-provider';

  const ever = new ProviderRpcClient();
  ```

- **With `everscale-standalone-client`:**

  In case your app doesn't require user interaction, it can use some kind of fallback provider.
  Depending on `forceUseFallback` parameter it will either always use fallback or only
  when injected rpc object was not found.

  For more information on setting up and using the Everscale Standalone Client, please refer to the [Standalone Client Guide](./standalone/1-introduction.md).

Right after provider is initialized its state can be retrieved:

```typescript
const currentProviderState = await provider.getProviderState();
```

<GetProviderStateComponent />

> You need to install an extension to be able to play with the demos.

## Permissions

Each RPC method requires some set of permissions to be executed. Therefore,
the website must request a required subset of them to be able to execute these methods.
Each permission can have some data assigned to it.

At the moment there are only two permissions:

- `basic` - needed for all simple methods like calculating account address or getting transactions.
  This permission doesn't have any data assigned to it.
- `accountInteraction` - any request which requires user interaction (e.g. through popup)
  requires this permission.
  ```typescript
  // Assigned data:
  type AccountInteractionData = {
    // Address of the selected wallet
    address: Address;
    // Preferred public key (usually a public key from the selected wallet)
    publicKey: string;
    // Hint about wallet contract type
    contractType: WalletContractType;
  };
  ```

```typescript
// You can subscribe to permission changes in one place
(await provider.subscribe('permissionsChanged')).on('data', permissions => {
  // You can update component state here
  console.log(permissions);
});

// NOTE: subscription object can be used during the disposal:
//   const subscription = await provider.subscribe('permissionsChanged');
//   subscription.on('data', data => { ... });
//   ...
//   await subscription.unsubscribe();

// Request all permissions
const permissions = await provider.requestPermissions({
  permissions: ['basic', 'accountInteraction'],
});

// ...

// Log out and disable all permissions
await provider.disconnect();
```

::: info
You don't need to request permissions while using standalone client with NodeJS.
`requestPermissions` will not give errors, but it will not do anything either.
:::

<div class="demo">
  <button @click="requestPermissions">Request permissions</button>
  <button @click="disconnect">Log Out</button>
  <pre v-if="permissions != null">{{ permissions }}</pre>
</div>

> NOTE: You can check current provider state using `getProviderState` demo.

## Changing account

Quite often there may be a situation in which the user works with your app through several accounts.
In order to change your account, you can either simply log out and log in, but then all subscriptions
will be reset. Therefore, to change the account there is a separate method that is preferable to use:

```typescript
// It will trigger `permissionsChanged` event, where `accountInteraction`
// will contain the selected account
await provider.changeAccount();
```

<div class="demo">
  <button @click="changeAccount">Change account</button>
</div>

> NOTE: `changeAccount` requires `accountInteraction` permissions

## Detecting Provider-enabled browsers

To determine whether your browser has an `Provider`, you can use the `hasEverscaleProvider()` function.
Here's an example of how to use it:

#### Using the hasEverscaleProvider() function

Import the `hasEverscaleProvider()` function from the 'everscale-inpage-provider' package and use it to check if your browser supports TVM-compatible blockchains.

```typescript
import { hasEverscaleProvider } from 'everscale-inpage-provider';

const hasProvider = await hasEverscaleProvider();
if (hasProvider) {
  console.log('Provider is detected');
} else {
  console.log('Provider is not detected');
}
```

::: info Additional notes:

- `hasEverscaleProvider()` will always return `false` in Web Workers or NodeJS environment. Otherwise, it will wait until the page is loaded and check whether the RPC object is injected.
- You can explicitly wait until the provider is fully initialized using:
  ```typescript
  await provider.ensureInitialized();
  ```
  This function will either throw an exception if there are some problems, or wait until the extension/fallback initialization promise is resolved.
- There are several lifecycle events to provide better error messages or state info:
  - `connected` - Called every time when provider connection is established.
  - `disconnected` - Called when inpage provider disconnects from extension.
  - `networkChanged` - Called each time the user changes network.
  - `permissionsChanged` - Called when permissions are changed.
  - `loggedOut` - Called when the user logs out of the extension (completely).

:::

## What's next?

At this point, you should have understood roughly the basic structure of a provider.
However, we have not yet interacted with the blockchain in any way!
Let's fix it in the next sections, in which we will cover all popular use cases.
