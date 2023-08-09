---
title: Everscale Inpage Provider
outline: deep
---

<!--
<script setup>
import { onMounted } from 'vue';

onMounted(async () => {
  const vpSidebar = document.getElementsByClassName('VPSidebar')[0];
  const curtain = document.querySelector('.VPSidebar .curtain');
  const bsgColor = getComputedStyle(document.documentElement).getPropertyValue('--vp-sidebar-bg-color');

  vpSidebar.style.backgroundColor = bsgColor;
  curtain.style.backgroundColor = bsgColor;

});
</script> -->

# Overview

Before integrating with the blockchain, it is important to understand how it works. The following will be a brief description of the
various aspects that are important to understand before considering further work with the library.

For a detailed explanation of how everything works, read [the whitepaper] or [documentation](https://docs.everscale.network/arch).

## Data representation

_Please refer to Chapter 1.1 of [the whitepaper]_

At a basic level everything in Ever is a _cell_. Each _cell_ consists of up to **1023 data bits** and **up to 4 references** to other
cells. Cyclic cell references are not allowed so the cells are usually organized into _tree of cells_.

Any value may be represented as a tree of cells. The specific structure of representing various data is described in
[the ABI specification](https://github.com/tonlabs/ton-labs-abi/blob/master/docs/ABI_2.0_spec.md).

In addition to the parameters of the cell itself, there are some restrictions on the structure as a whole:

- Max tree of cells depth is **2<sup>16</sup>**

- Max tree of cells depth for an external messages is **512**

- The contract pays for the storage of this data, so it is important to keep track of how you describe your structures, order is important
  for tighter packing. If there is a lot of nested data in the contract, then over time it can use up its entire balance.

  - In the _masterchain_ each bit costs 1000 units and ever reference costs 500000 units.
  - In the _base workchain_ each bit costs 1 unit and every reference costs 500 units.

  _(the actual values can be viewed in the 18th parameter of the network config)_

> ### A small example of cells data
>
> Tuple type: `(uint32, bool, uint32[])`
>
> Values: `(0x539, true, [0x0B, 0x16])`
>
> Cell structure to represent this values:
>
> ```
> Ordinary   l: 000   bits: 66   refs: 1   data: 00000539800000016_
> hashes: 29a11f1e37e0c64354f52be1f517992639e91a7d07487630c1e3800a479277ba
> depths: 2
>   └─Ordinary   l: 000   bits: 9   refs: 2   data: cfc_
>   hashes: a590c29333e1d2060a079b8bd1f8f57a56408d87e1586ccbe6caa888ae34abc0
>   depths: 1
>   ├─Ordinary   l: 000   bits: 34   refs: 0   data: 00000002e_
>   │ hashes: 3d10b2cb5aa6f262a35dc82a384d326f9b3667c1c8002021382987a88ca8482b
>   │ depths: 0
>   └─Ordinary   l: 000   bits: 34   refs: 0   data: 00000005a_
>     hashes: 43bd1f7b6ad2214e74ff517098fc7c45b9acd979b0da5e0cc804f6af313ce474
>     depths: 0
> ```
>
> Encoded cell: `te6ccgEBBAEAIAABEQAABTmAAAABYAECA8/AAwIACQAAAAWgAAkAAAAC4A==`
>
> > By the way, you can play with the cells on [ever.bytie.moe](https://ever.bytie.moe/serializer)

In some places the hash of the cell may be needed. It is important to understand that this is a kind of complex hash from the representation
of a cell in a specific format, so it is better to use `getBocHash` method or calculate it in advance.

Note that when you work with the extension and this library, all cells are passed or returned as a base64 string
(see the encoded cell in the example above).

## Blockchain architecture

_Please refer to Chapter 1.2 of [the whitepaper]_

Everscale is a highly scalable blockchain. This was achieved using a complex architecture with _The Infinite Sharding Paradigm_. Each
account can
be considered as lying in its separate _"accountchain"_, and the (virtual) blocks of these _accountchains_ are grouped into _shardchain_
blocks. Because of this, each block and its state can be easily divided into two distinct parts at any time with different sets of these
accountchains (that is, each shardchain can split into two parts, and in the same way merge back after a while).

In addition to the account blocks, the shardchain block contains some general information such as unix/logical time, sequence numbers of its
predecessors, some information about validator set and other stuff.

Several shardchains work within the same group called the _workchain_. At the very start of the network each workchain contains only one
shardchain. Further, once in several blocks, shardchains are divided up to a certain minimum number of times. After that, they will be split
as soon as there is a sufficiently large load in any of them and merge back as soon as the load subsides

At the moment, there are two workchains in Everscale - _masterchain_ (id -1) and _base workchain_ (id 0). Validators can vote to add a new
workchain, but so far no one has done this on the mainnet. Most of the contracts in the Everscale work in the base workchain. It has
relatively small commissions and many shards.

Masterchain is a special case of workchain. It has notable differences:

- Shardchains in masterchain cannot be split or merged, so there is only one shardchain in it.

- Blocks in it contain additional important information:<br/>
  _ShardHashes_, a binary tree with a list of all defined shardchains along with the hashes of the latest block inside each of the
  listed shardchains. It is the inclusion of a shardchain block into this structure that makes a shardchain block _"canonical"_, and
  enables other shardchains blocks to refer to data (e.g., outbound messages) contained in the shardchain block.

- The state of masterchain contains global configuration parameters of the whole TON blockchain, such as gas prices and other stuff.

> ### A little about shard id
>
> Each shard has its own id which is also used to determine which account can get into it.
>
> It is a 64-bit unsigned integer which has a mask part and one marker bit. In binary form it looks like `xx..xx100..00` where the `x` part
> is a mask (may be absent) and a marker bit follows immediately after this mask.
>
> At the very start of the network, there is one shard with the id `800...000` (in hex form). It has only one marker bit at the beginning.
> Further, when this shard is split, for the new ids mask bit is shifted to the right and two shards are created with different values
> for the bit before the shifted one.
>
> A small visual diagram for this in binary form:
>
> ```
> .1000000....                 | mask:
> ----------------------------------------------------------
> .1000000.... -> 0.100000.... | mask: 0
>                 1.100000.... | mask: 1
> ----------------------------------------------------------
> 0.100000.... -> 00.10000.... | mask: 00
>                 01.10000.... | mask: 01
> 1.100000.... -> 10.10000.... | mask: 10
>                 11.10000.... | mask: 11
> ----------------------------------------------------------
> 00.10000.... -> 000.1000.... | mask: 000
>                 001.1000.... | mask: 001
> 01.10000.... -> 010.1000.... | mask: 010
>                 011.1000.... | mask: 011
> 10.10000.... -> 100.1000.... | mask: 100
>                 101.1000.... | mask: 101
> 11.10000.... -> 110.1000.... | mask: 110
>                 111.1000.... | mask: 111
> ----------------------------------------------------------
> ...and so on...
> ```
>
> And now the most important thing is why all this is needed -
> **an account gets into the shard if its address starts with a mask from the id**.

## Accounts

An account is identified by its full address, and is completely described by its state.

Full address consists of a workchain id and an account id. Its string representation could
be described with a simple regex - `/^(?:-1|0):[0-9a-fA-F]{64}$/`.
Account id must be equal to the hash of the initial account state, otherwise, it will
be impossible to initialize it with this state or do anything with the accumulated funds
in the account balance.

Each account can be in one of possible states:

- `nonexist` - there were no transactions on this account, so it doesn't have any data.
  We can say that initially all 2<sup>256</sup> accounts are in this state.
- `uninit` - account has some data, which contains balance and meta info.
  At this state account doesn't have any smart contract code/persistent data yet.
  An account enters this state, for example, when it was `nonexist` and some other
  account sent some tokens to it.
- `active` - account has smart contract code, persistent data and balance.
  At this state it can perform some logic during the transaction and change its persistent data.
  An account enters this state when it was `uninit` and there was an incoming message
  with `state_init` param (note, that to be able to _deploy_ this account, the `state_init`
  hash must be equal to account id).
- `frozen` - account can't perform any operation, this state contains only previous state
  hash. When storage fee on account is higher than its balance it enters this state. To
  _unfreeze_ it you can send an internal message with attached `state_init` which has
  the specified hash. It might be hard to reconstruct this (you must apply all transactions)
  therefore you should never allow such a situation.

[Account initial state](https://github.com/broxus/ton-labs-block/blob/4824b39df2f9665cf78378c9481c4ddcffabe7ae/src/messages.rs#L1707-L1721) (_
TVC_) contains code and data.
In the solidity ABI, data in TVC is a dictionary with 64-bit keys and arbitrary values.
All static variables are written to it at the appropriate indexes (see `data` field in JSON ABI).
Thus, to calculate the address of an account, you must use the TVC from the compiler,
update its static variables, and compute its hash.

## Messages

_Please refer to [the docs](https://docs.ton.dev/86757ecb2/p/45e664-basics-of-free-ton-blockchain/t/20b3af)_

> ### Logical time
>
> Before considering messages, it is necessary to know what is the _logical time_. It is a non-negative 64-bit integer,
> assigned to certain events as follows:
>
> > If an event _e_ logically depends on events _e<sub>1</sub> ,... , e<sub>n</sub>_, then logical time of _e_ is the smallest
> > non-negative integer that is greater than all logical times of _e<sub>i</sub>_

In TVM-compatibles blockchain, messages exist "separately" from transactions as an entity. There are three types of messages:

- _External inbound_ - doesn't contain source address but has the destination address, doesn't have any value. It is used to
  call contracts from outside or to deploy them.

  - There are some limitations on their size, and it is also not guaranteed that they will be delivered in order or that they will
    be delivered at all.

- _Internal_ - has both source and destination addresses and can have some value. It allows contracts to communicate with each other.
  There are no reasonable limitations on their size.

  - It is important to note that each internal message is unique (because it contains its full source address along with its logical
    creation time, and all outbound messages created by the same smart contract have strictly increasing logical creation times),
    so, by the hash of the internal message, you can definitely find it (but the same message can be presented in two transactions,
    as internal outgoing and internal incoming).
  - Order of internal messages is guaranteed (within a single shard). The order of messages is preserved by their logical time.
  - Delivery of these messages is also guaranteed.
  - Internal messages within one shard can reach the destination in almost the same block, however when message is sent to the account
    which is in the different shard it may take a long time.

- _External outbound_ - has the source address but doesn't contain source address, doesn't have any value. It is used as the
  events the contracts produce for the outside world. Use them to implement some off-chain logic.

Each message can contain body which is an arbitrary cell. It is used for function input/output or event data.

## Transactions

_Please refer to Chapter 4.2 of [the whitepaper]_

Transaction describes the change of exactly one account.

### Phases of an ordinary transaction

An ordinary transaction is performed in several _phases_:

- _Storage phase_ - collects due storage payments for the account state (including smart-contract code and data, if present) up to the
  present time. The smart contract may be _frozen_ as as result.

  - If the smart contract did not exist before, the storage phase is skipped

- _Credit phase_ - The account is credited with the value of the inbound message received.

  - Skipped if the transaction was initiated by an external inbound message
  - Executed very first if the `bounce` flag was set to `false` in the incoming message

- _Computing phase_ - The code of the smart contract is invoked inside an instance of TVM with adequate parameters, including a copy of the
  inbound message and of the persistent data, and terminates with an exit code, the new persistent data, and an action list
  (which includes, for instance, outbound messages to be sent). The processing phase may lead to the creation of a new account
  (uninitialized or active), or to the activation of a previously uninitialized or frozen account. The gas payment, equal to the product
  of the gas price and the gas consumed, is exacted from the account balance.

  - Validators do not include a transaction into the network if it was generated by an external message and the exit code in this phase is
    different from a successful one

- _Action phase_ - If the smart contract has terminated successfully (with exit code 0 or 1), the actions from the list are performed.
  If it is impossible to perform all of them then the transactions is aborted and the account state is rolled back. The transaction is also
  aborted if the smart contract did not terminate successfully, or if it was not possible to invoke the smart contract at all because it
  is uninitialized or frozen.

  - Note the transaction may be included into the network even if it was generated by an external message (when the previous phase was
    successful). An included transaction means that fees will be deducted from the account balance even if rolled back.

- _Bounce phase_ - If the transaction has been aborted, and the inbound message has its `bounce` flag set, then it is "bounced" by
  automatically generating an outbound message (with the `bounce` flag clear, but `bounced` set) to its original sender.
  - Almost all value of the origin inbound message is transferred to the generated message.

### Transaction fees

_Please refer to [the docs](https://docs.ton.dev/86757ecb2/p/632251-fee-calculation-details)_

Transaction fees consist of fees from all executed phases:

```
transaction_fee = storage_fee + gas_fees + total_action_fees
  + inbound_external_message_fee + outbound_internal_messages_fee
```

- `storage_fee` - contract storage fee since the previous transaction.

  ```
  storage_fee = ceil (
      (account.bits * bit_price + account.cells * cell_price) * period / 2 ^ 16
  )
  ```

  where `bit_price` and `cell_price` and from the network config (p18, e.g. `1` and `500` for mainnet)

- `gas_fees` - fees from the computing phase.

- `total_action_fees` - fees from action phase.

- `inbound_external_message_fee` - external message forwarding fee in case the transaction was produced by external message.

- `outbound_internal_messages_fee` - forwarding fee for outgoing messages.

Based on the above, the cost of executing a transaction can only be calculated by running it locally on the executor.
Note, that this will be an approximate value as it depends on time and will be a bit greater at the time the transaction is executed.

[the whitepaper]: https://ton.org/tblkch.pdf
