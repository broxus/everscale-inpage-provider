---
title: Everscale Inpage Provider
outline: deep
---

# Manipulating Time

The Everscale Standalone Client allows you to adjust the time offset using the `Clock` object. This can be useful in scenarios where the time on your machine is not synchronized with the server or the blockchain network.

## Creating a Clock Object

When creating a new instance of the `EverscaleStandaloneClient`, you can pass a `Clock` object as part of the properties:

```typescript
const client = await EverscaleStandaloneClient.create({
  // Other properties...
  clock: new Clock(),
});
```

## Adjusting the Time Offset

You can adjust the time offset by setting the `offset` property of the `Clock` object:

```typescript
client.clock.offset = 1000; // Offset by 1000 milliseconds
```

This will update the offset in all affected providers.

## Getting the Current Time

You can get the current time, adjusted by the offset, by accessing the `time` property of the `Clock` object:

```typescript
console.log(client.clock.time); // Current time in milliseconds, adjusted by the offset
```

## Detaching Providers

If you want to detach all affected providers, you can call the `detach` method of the `Clock` object:

```typescript
client.clock.detach();
```

This will clear the list of affected providers, but their offset will remain the same.

::: warning Note
Remember, manipulating time is a sensitive operation and should be done with care. Always ensure that any adjustments made are necessary and correct to prevent potential issues with transaction processing or other time-sensitive operations.
:::
