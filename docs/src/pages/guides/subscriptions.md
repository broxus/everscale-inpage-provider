---
title: Everscale Inpage Provider
outline: deep
---

# Subscribing

In the TVM-compatible blockchains, subscribing to events and messages is a crucial aspect because of the nature of how messages are handled and delivered. In particular, the delivery of deferred messages (messages that are not processed immediately) can be delayed, especially when they are sent to accounts in different shards. To handle these cases effectively and to ensure that your application receives updates in real-time, it is necessary to subscribe to the relevant events and messages.

Subscribing enables your application to receive updates whenever a particular event occurs, such as a contract state change, new transactions, network changes, or even when a delayed message is delivered or expired. This feature allows you to implement off-chain logic and stay up-to-date with the on-chain events.

There are two primary ways to subscribe to events: using the `ProviderRpcClient` and through a `Contract` instance. The key differences between these two approaches are as follows:

1. **Listener Level**: `ProviderRpcClient` listens to events at the provider and blockchain level, whereas a `Contract` instance listens to events at the specific contract level.
2. **Filtering**: Subscribing to events through a `Contract` instance provides a narrower event filtering since it is focused on events from a specific contract. When using `ProviderRpcClient`, your application might need to handle more events to track only those related to the desired contracts.
3. **Scope**: Using `ProviderRpcClient` can be helpful for monitoring network state and interaction with the extension, while a `Contract` instance provides deeper control over a specific contract's events.

Depending on your needs, you can use one of these approaches or combine them for optimal control over events in your application.

## Overview

The `ProviderRpcClient` class allows you to subscribe to various events in the blockchain. This section will provide an overview of the different events and their significance, along with examples of subscribing to each event.

There are two categories of events: Provider events and Blockchain events. Provider events are related to the interaction between your application and the extension, while Blockchain events are the result of actions occurring within the network, particularly involving contracts.

### Provider events

- **NetworkChanged**: Triggered each time the user changes the network.
- **PermissionsChanged**: Triggered when permissions are changed, such as when an account has been removed from the current accountInteraction permission or disconnect method was called.
- **LoggedOut**: Triggered when the user logs out of the extension.
- **Connected**: Triggered when the in-page provider connects to the extension.
- **Disconnected**: Triggered when the in-page provider disconnects from the extension.

### Blockchain events

- **TransactionsFound**: Triggered on each new transactions batch, received on subscription.
- **ContractStateChanged**: Triggered every time a contract state changes.
- **MessageStatusUpdated**: Triggered every time a delayed message is delivered or expired.
  disconnect method is called.

Using the `ProviderRpcClient` class, you can subscribe to these events to receive real-time updates and respond accordingly in your application. For example, you can listen for the 'connected' event to enable your application's features once connected to the network or handle the 'disconnected' event to prompt the user to reconnect.

With `provider.Contract` methods such as `transactions`, `events`, `waitForEvent`, and `getPastEvents`, you can process Blockchain events related to contracts, like handling transaction events, decoding contract events, and waiting for events that match specific criteria.

## Subscribing to Provider Events

To subscribe to events, you need to use the `ProviderRpcClient.subscribe` method. This method takes the event name as an argument and returns an instance of a subscription. You can then listen to the event using the `on` method and pass in a callback function to handle the event.

Using the `ProviderRpcClient` class, you can subscribe to these events to receive real-time updates and respond accordingly in your application. For example, you can listen for the `'PermissionsChanged'` event to enable your application's features once connected to the network or handle the `'LoggedOut'` event to prompt the user to reconnect.

```typescript
// Subscribe to provider events
const permissionsSub = await provider.subscribe('permissionsChanged');
const networkChangeSub = await provider.subscribe('networkChanged');
const loggedOutSub = await provider.subscribe('loggedOut');

// Listen to provider events
permissionsSub.on('data', data => {
  console.log('permissionsChanged', data);
});

networkChangeSub.on('data', data => {
  console.log('networkChanged', data);
});

loggedOutSub.on('data', data => {
  console.log('loggedOut', data);
});
```

```typescript
// Unsubscribe from provider events
permissionsSub.unsubscribe();
networkChangeSub.unsubscribe();
loggedOutSub.unsubscribe();

// Alternatively, you can unsubscribe from all events,
// but this will also remove permissions and disconnect provider.
await provider.disconnect();
```

<ProviderEventsComponent />

### Blockchain Events

Blockchain events are generated as a result of actions occurring within the network, particularly involving contracts. Events are emitted by smart contracts to provide additional information during transaction execution. They serve as a way for smart contracts to communicate with the outside world, allowing applications to monitor and react to changes within the network, such as new transactions, contract state changes, or message status updates.

Events can only exist as external outgoing messages and contain arguments to convey the necessary information. They don't have any functionality other than serving as a means to transmit data. Events are essential for implementing off-chain logic that relies on on-chain data, such as tracking the progress of a transaction or monitoring changes in contract states.

To subscribe and listen to Blockchain events, you will need to use the `ProviderRpcClient` and `provider.Contract`.

```typescript
// Subscribe to blockchain events
const transactionsSub = await provider.subscribe(
  'transactionsFound',
  { address: new Address(exampleContractAddress) },
);
const contractStateSub = await provider.subscribe(
  'contractStateChanged',
  {
    address: new Address(exampleContractAddress),
  },
);
const msgStatusSub = await provider.subscribe('messageStatusUpdated');

// Listen to blockchain events
transactionsSub.on('data', data => {
  console.log('transactionsFound', data);

  // Unsubscribe
  transactionsSub.unsubscribe();
});

contractStateSub.on('data', data => {
  console.log('contractStateChanged', data);
});

msgStatusSub.on('data', data => {
  console.log('messageStatusUpdated', data);
});
```

<BlockchainEventsComponent />

## Subscribing to Contract Events

Subscribing to events through a `Contract` instance allows your application to listen and handle events specifically related to that contract. This can include events related to transactions, contract state changes, and other custom events defined within the contract.

```typescript
const ABI = {
  ...,
  events: [
    {
      name: 'StateChanged',
      inputs: [
        {
          components: [
            { name: 'first', type: 'uint32' },
            { name: 'second', type: 'string' },
          ],
          name: 'complexState',
          type: 'tuple',
        },
      ],
      outputs: [],
    },
  ],
};
```

To subscribe and listen to contract-specific events, you will need to use the `provider.Contract` instance together with the `provider.Subscriber` class.

```typescript
// Create a contract instance
const exampleContract = new provider.Contract(
  exampleAbi,
  exampleAddress,
);

// Create a subscriber
const subscriber = new provider.Subscriber();

// Subscribe to contract events
const contractEvents = exampleContract.events(subscriber);

// Listen to contract events
contractEvents.on(event => {
  console.log('contractEvent', event);
});

// Unsubscribe from contract events
contractEvents.unsubscribe();
```

<ListenContractEventsComponent />

### Get Past Events

```typescript
// Get past events
const pastEvents = await exampleContract.getPastEvents({
  filter: 'StateChanged',
  range: {
    fromUtime: 1682651393814,
  },
});

console.log('pastEvents', pastEvents);
```

<GetPastEventsComponent />

## Subscriber Class

The `Subscriber` class allows you to subscribe to various events in the blockchain, such as new transactions and contract state changes. This class provides a convenient way to listen for these events and react accordingly in your application. The `Subscriber` class offers a more granular approach to event subscriptions compared to the `ProviderRpcClient` and `Contract` instances mentioned earlier in the guide.

In this section, we will cover how to use the `Subscriber` class to subscribe to different events, such as transactions, states, old transactions, and transaction traces.

### Transactions

The `transactions` method of the `Subscriber` class provides real-time updates of all transactions associated with a given address. These transactions could include any changes to the state of contracts associated with that address or any messages sent from or received by the address.

Here's an example of how to subscribe to transactions:

```typescript
import {
  ProviderRpcClient,
  Subscriber,
} from 'everscale-inpage-provider';

// Initialize the provider and subscriber
const provider = new ProviderRpcClient(/* ... */);
const subscriber = new Subscriber(provider);

// Subscribe to transactions
const transactionsStream = subscriber.transactions(exampleAddress);

// Listen to transactions
transactionsStream.on(data => {
  console.log('New transactions:', data);
});

// Unsubscribe from the transactions
transactionsStream.stopProducer();
```

<SubscriberTxComponent />

### Contract State Changes

The `states` method allows an application to subscribe to changes in the state of a contract at a specific address. This provides a way to react in real-time to significant changes in a contract's state, such as changes in ownership, balance, or other contract-specific parameters.

Here's an example of how to subscribe to contract state changes:

```typescript
// Subscribe to contract state changes
const statesStream = subscriber.states(exampleAddress);

// Listen to contract state changes
statesStream.on(data => {
  console.log('Contract state changed:', data);
});

// Unsubscribe from the contract state changes
statesStream.unsubscribe();
```

<SubscriberStateComponent />

### Transaction Traces

The `trace` method provides a stream of "child" transactions associated with a "root" transaction. This allows you to follow the full execution path of a complex transaction that involves multip nal transactions, which can be useful for debugging, performance tracking, or understanding transaction behavior.

Here's an example of how to subscribe to transaction traces:

```typescript
const traceStream = subscriber.trace(rootTransaction);

traceStream.on(data => {
  console.log('Child transactions:', data);
});

traceStream.unsubscribe();
```

<SubscriberTraceComponent />

## Decoding Transactions, Messages, and Events

The `provider.Contract` instance provides methods for decoding transactions, messages, and events using the specified ABI methods or events. The decoding methods are useful for interpreting the data stored within transactions, messages, and events on the TVM-compatible blockchain.

Here are examples of how to use the contract instance for decoding transactions, messages, and events:

### Transaction

To decode a transaction, you can use the `decodeTransaction` method. You need to provide the transaction, and the method used in the transaction.

```typescript
// Create contract instance
const contract = provider.Contract(exampleAbi, exampleAddress);

// Decode transaction
const decodedTransaction = await contract.decodeTransaction({
  transaction: tx,
  methods: ['setVariable', 'setVariableExternal'],
});

console.log('Decoded transaction:', decodedTransaction);
```

<DecodeTransactionComponent />

### Transaction Events

```typescript
// Decode transaction events
const decodedTransactionEvents =
  await contract.decodeTransactionEvents({
    transaction: tx,
  });

console.log('Decoded transaction events:', decodedTransactionEvents);
```

### Input Message

To decode an input message, use the `decodeInputMessage` method. You need to provide the the input message to decode, and the method used in the message.

```typescript
// Input message
const msgBody = `te6ccgEBAQEAFgAAKDja0OwAAAAAAAAAAAAAAAAAAAU5`;

// Decode input message
const decodedInputMessage = await contract.decodeInputMessage({
  internal: true, // Set to true if the message is an internal message
  body: inputMessage,
  methods: ['setState'], // Specify the methods used in the message
});

console.log('Decoded input message:', decodedInputMessage);
```

<DecodeInputMsgComponent />

### Output Message

To decode an output message, use the `decodeOutputMessage` method. Provide the output message to decode, and the method used in the message.

```typescript
const outputMessageBody =
  'te6ccgEBAQEAXwAAubiFxSVsWc7pJv2rkYyWYKvwhEOmZGICZRAKKG5WEpBwpXUHtcgRydSCYKC3EUaic0ikBcBORHMb3we6tyRwQUAAADD6jXh5aABF7kAAAAAAAAAAAAAAAAAAAArwA==';

// Decode output message
const decodedOutputMessage = await contract.decodeOutputMessage({
  body: outputMessageBody,
  methods: ['setVariable'],
});

console.log('Decoded output message:', decodedOutputMessage);
```

<DecodeOutputMsgComponent />

### Event

To decode an event, use the `decodeEvent` method. You need to provide the encoded event body, and the event name.

```typescript
// Encoded internal event boc
const eventBoc = 'te6ccgEBAgEAEQABEFM5yKUAAACZAQAIdGVzdA==';

// Decode event
const decodedEvent = await contract.decodeEvent({
  body: eventBoc,
  events: 'StateChanged',
});

console.log('Decoded event:', decodedEvent);
```

<DecodeEventComponent />

## Logical Time (LT)

Logical Time (LT) is used to determine the order of transactions and process them in the correct sequence. In the provided code snippets, LT is used to filter transactions based on their logical time, ensuring that only transactions with a higher LT than the specified `fromLt` parameter are processed. This can help maintain the correct order of transactions and ensure that your application processes transactions consistently.

### Transactions

To use LT for filtering and sorting transactions, you can utilize the `LT_COLLATOR` object provided in the code snippets. This object is an instance of `Intl.Collator` configured to compare strings representing LT values numerically.

For example, to filter transactions based on their LT, you can use the `filter` method on the `transactions` array:

```typescript
const filteredTransactions = transactions.filter(
  item =>
    (params.fromLt == null ||
      LT_COLLATOR.compare(item.id.lt, params.fromLt) > 0) &&
    (params.fromUtime == null || item.createdAt > params.fromUtime),
);
```

In this example, `filteredTransactions` will only include transactions with an LT greater than the `params.fromLt` value and a creation timestamp greater than the `params.fromUtime` value.

### Old Transactions

The `oldTransactions` method of the `Subscriber` class returns a stream of old transactions for a given address, filtered by the specified `fromLt` and `fromUtime` parameters. The method uses the `UnorderedTransactionsScanner` class internally to fetch and filter transactions based on their LT and creation timestamp.

```typescript
public oldTransactions(
  address: Address,
  filter?: { fromLt?: string, fromUtime?: number },
): IdentityStream<ProviderEventData<'transactionsFound'>, true> {
  // ...
}
```

In this method, the `UnorderedTransactionsScanner` class fetches transactions for the specified address and filters them using the provided `fromLt` and `fromUtime` parameters. This ensures that the resulting stream of old transactions only includes transactions with an LT greater than `fromLt` and a creation timestamp greater than `fromUtime`.

### Transaction Traces

The `trace` method of the `Subscriber` class returns a stream of child transactions associated with a root transaction. The method uses the `TraceTransactionsScanner` class internally to fetch child transactions and maintain their correct order based on their LT.

In the `TraceTransactionsScanner` class, the `makePendingTransaction` function is used to fetch transactions based on their message hash. The function keeps retrying to fetch the transaction until it succeeds or the scanner is stopped. This ensures that the resulting stream of child transactions maintains the correct order based on their LT.

By using LT in these methods and classes, your application can ensure that transactions are processed in the correct order, maintaining consistency in the handling of transactions and their associated data.

## Combinators

Combinators are powerful tools for working with streams, allowing you to manipulate, filter, and combine data in various ways. In the "Combinators" section, different combinators available in the `StreamImpl` class are explained and examples are provided for each.

These combinators can be used individually or in combination to create powerful data processing pipelines for your streams. By understanding and utilizing these tools, you can efficiently manipulate and transform your data streams to suit your application's needs.

### Tap

The `tap` combinator allows you to perform side effects for each item in the stream without altering the original data. This can be useful for logging, debugging, or performing other actions that do not affect the stream's output.

```typescript
const tappedStream = transactionsStream.tap(item => {
  console.log('Address:', item.address);
  console.log('Transactions:', item.transactions);
  console.log('Info:', item.info);
});
```

### Map

The `map` combinator applies a function to each item in the stream, transforming the original data into a new format. This can be useful for data processing or converting data types.

```typescript
const mappedStream = transactionsStream.map(item => {
  return {
    address: item.address,
    transactionsCount: item.transactions.length,
    info: item.info,
  };
});
```

### Filter

The `filter` combinator allows you to selectively include or exclude items from the stream based on a predicate function. This can be useful for filtering out unwanted data or focusing on specific elements.

```typescript
const filteredStream = transactionsStream.filter(item => {
  return item.transactions.length > 0;
});
```

### FilterMap

The `filterMap` combinator combines the functionality of `map` and `filter`. It applies a function to each item in the stream, and if the result is not `undefined`, it includes the result in the output stream.

```typescript
const filterMappedStream = stream.filterMap(item => {
  if (item % 2 === 0) {
    return item * 2;
  }
  return undefined;
});
```

### FlatMap

The `flatMap` combinator applies a function to each item in the stream, and the function returns an array of new items. The resulting arrays are then flattened into a single output stream.

```typescript
const flatMappedStream = transactionsStream.flatMap(item => {
  return item.transactions.map(transaction => ({
    address: item.address,
    transaction: transaction,
    info: item.info,
  }));
});
```

### Merge

The `merge` combinator combines two streams into a single output stream. This can be useful for combining data from multiple sources or processing streams in parallel.

```typescript
const mergedStream = stream1.merge(stream2);
```

### Enumerate

The `enumerate` combinator adds an index to each item in the stream, resulting in an output stream of objects containing the original item and its index.

```typescript
const enumeratedStream = stream.enumerate();
```

### Skip

The `skip` combinator allows you to ignore the first `n` items in the stream. This can be useful for skipping over unwanted data or starting the stream at a specific position.

```typescript
const skippedStream = stream.skip(5);
```

### SkipWhile

The `skipWhile` combinator skips items in the stream as long as the predicate function returns `true`. Once the predicate function returns `false`, it stops skipping items and includes the remaining items in the output stream.

```typescript
const skipWhileStream = transactionsStream.skipWhile(item => {
  return item.transactions.length < 5;
});
```

### Take

The `take` combinator limits the output stream to the first `n` items. This can be useful for limiting the amount of data processed or selecting a specific range of items.

```typescript
const takenStream = stream.take(5);
```

### TakeWhile

The `takeWhile` combinator takes items from the stream as long as the predicate function returns `true`. Once the predicate function returns `false`, it stops taking items and ends the output stream.

```typescript
const takeWhileStream = transactionsStream.takeWhile(item => {
  return item.transactions.length > 0;
});
```

### TakeWhileMap

The `takeWhileMap` combinator is similar to `takeWhile`, but it also applies a function to each item in the stream. The output stream includes the results of the function as long as the result is not `undefined`. Once the function returns `undefined`, it stops taking items and ends the output stream.

```typescript
const takeWhileMappedStream = transactionsStream.takeWhileMap(
  item => {
    if (item.transactions.length > 0) {
      return {
        address: item.address,
        transactionsCount: item.transactions.length,
        info: item.info,
      };
    }
    return undefined;
  },
);
```

These combinators can be used individually or in combination to create powerful data processing pipelines for your streams. By understanding and utilizing these tools, you can efficiently manipulate and transform your data streams to suit your application's needs.

Consistency: Consistency refers to ensuring the correct and consistent processing of data received through subscriptions. This may involve various aspects, such as handling transactions and contract states, as well as ensuring that data from different sources are properly combined and processed. The methods provided by the `StreamImpl` class, such as `map`, `filter`, `skip`, `take`, and others, can be used to ensure data consistency in subscriptions.

Here is an example of how to ensure data consistency in subscriptions:

Logical Time (LT): LT refers to the logical time of transactions, which is used to determine the order of transactions and process them in the correct sequence. This can be related to methods such as `transactions`, `trace`, and `oldTransactions`, which can return transactions sorted in descending order of logical time.

In the provided code snippets, LT is used to filter transactions based on their logical time, ensuring that only transactions with a higher LT than the specified `fromLt` parameter are processed. This can help maintain the correct order of transactions and ensure that your application processes transactions consistently.

Here's a guide on how to use LT in the context of the given code examples:

## Ensuring Data Consistency

To ensure data consistency, you can use the methods provided by the `StreamImpl` class to manipulate and process the data received through subscriptions. These methods can be used individually or in combination to create a consistent data processing pipeline for your application.

For example, consider a scenario in which you want to track the balance of a specific contract address and ensure that the data remains consistent even when there are multiple sources of updates.

```typescript
// Create a subscriber
const subscriber = new provider.Subscriber();

// Subscribe to contract state changes
const stateChangesStream = subscriber.states(exampleAddress);

// Subscribe to new transactions related to the address
const transactionsStream = subscriber.transactions(exampleAddress);

// Merge the two streams to create a combined stream
const combinedStream = stateChangesStream.merge(transactionsStream);

// Map the combined stream to extract the relevant balance data
const balanceStream = combinedStream.map(item => {
  if (item.type === 'stateChange') {
    return item.state.balance;
  } else if (item.type === 'transaction') {
    return item.transaction.balance;
  }
});

// Use the filter method to remove any undefined or null values
const filteredBalanceStream = balanceStream.filter(
  balance => balance !== undefined && balance !== null,
);

// Process the consistent balance data
filteredBalanceStream.on(balance => {
  console.log('Current balance:', balance);
});
```

In this example, we have used the `merge`, `map`, and `filter` methods to combine and process the data from two different sources (state changes and transactions) to create a consistent balance stream. By using these methods, you can ensure that the data received through subscriptions remains consistent and accurate, allowing your application to react appropriately to changes in the underlying data.

Remember that the key to ensuring data consistency in subscriptions is to properly handle and process the data received from different sources. By understanding and utilizing the various methods provided by the `StreamImpl` class, you can create powerful and consistent data processing pipelines for your application.
