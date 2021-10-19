# Introduction

This library seeks to be a powerful tool for building web applications that work with the [FreeTON blockchain](https://freeton.org/).
`ton-inpage-provider` helps you build statically type checked contract interaction, pack/unpack complex cell data structures or write
beautiful transaction subscriptions with a bunch of combinators.

It is a generalized interface around an object that is passed to the page by various extensions or programs. At the moment, several possible
providers are known:

- **TON Crystal Wallet** browser extension - an extension which is currently available only in Chrome
  ([link](https://chrome.google.com/webstore/detail/ton-crystal-wallet/cgeeodpfagjceefieflmdfphplkenlfk?hl=en) to the chrome web store).
  > Fully supports all features
- **TON Crystal Wallet** mobile app - on development stage. Can be built
  from [the sources](https://github.com/broxus/ton-wallet-crystal-flutter).
  > Has a built-in browser into which most of the required provider methods are forwarded

In the case when none of the providers is installed, you can use the built-in standalone client. It only supports methods that do not
involve user interaction (Its implementation is loaded only when it is used, so the size of the resulting bundle is not very large).

## TON Overview

Before integrating the extension, it is important to understand how TON blockchain works. The following will be a brief description of the
various aspects that are important to understand before considering further work with the library.

For a detailed explanation of how everything works, read [the whitepaper] or
[TON Labs documentation](https://docs.ton.dev/).

### Data representation

_Please refer to Chapter 1.1 of [the whitepaper]_

At a basic level everything in TON is a _cell_. Each _cell_ consists of up to **1023 data bits** and **up to four references** to other
cells. Cyclic cell references are not allowed so the cells are usually organized into _tree of cells_.

Any value may be represented as a tree of cells. The specific structure of the presentation of various data is described in
[the ABI specification](https://github.com/tonlabs/ton-labs-abi/blob/master/docs/ABI_2.0_spec.md).

In addition to the parameters of the cell itself, there are some restrictions on the structure as a whole:

- Max tree of cells depth is **2<sup>16</sup>**

- Max tree of cells depth for an external messages is **512**

- The contract pays for the storage of this data, so it is important to keep track of how you describe your structures, order is important
  for tighter packing. If there is a lot of nested data in the contract, then over time it can use up its entire balance.

    * In the _masterchain_ each bit costs 1000 units and ever reference costs 500000 units.
    * In the _base workchain_ each bit costs 1 unit and every reference costs 500 units.

  _(the actual values can be viewed in the 18th parameter of the network config)_

> #### A small example of cells data
>
> Tuple type: `(uint32, bool, uint32[])`
>
> Values: `(0x539, true, [0x0B, 0x16])`
>
> Cell structure to represent this values:
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
> ---
> By the way, you can play with the cells on [ton.bytie.moe](https://ton.bytie.moe/serializer)

In some places the hash of the cell may be needed. It is important to understand that this is a kind of complex hash from the representation
of a cell in a specific format, so it is better to use some SDK or calculate in advance.

Note that when you work with the extension and this library, all cells are passed or returned as a base64 string
(see the encoded cell in the example above).

### Blockchain architecture

_Please refer to Chapter 1.2 of [the whitepaper]_

TON is a highly scalable blockchain. This was achieved using a complex architecture with _The Infinite Sharding Paradigm_. Each account can
be considered as lying in its separate _"accountchain"_, and the (virtual) blocks of these _accountchains_ are grouped into _shardchain_
blocks. Because of this, each block and its state can be easily divided into two distinct parts at any time with different sets of these
accountchains (that is, each shardchain can split into two parts, and in the same way merge back after a while).

In addition to the account blocks, the shardchain block contains some general information such as unix/logical time, sequence numbers of its
predecessors, some information about validator set and other stuff.

Several shardchains work within the same group called the _workchain_. At the very start of the network each workchain contains only one
shardchain. Further, once in several blocks, shardchains are divided up to a certain minimum number of times. After that, they will be split
as soon as there is a sufficiently large load in any of them and merge back as soon as the load subsides

At the moment, there are two workchains in FreeTON - _masterchain_ (id -1) and _base workchain_ (id 0). Validators can vote to add a new
workchain, but so far no one has done this on the mainnet. Most of the contracts in the FreeTON work in the base workchain. It has
relatively small commissions and many shards.

Masterchain is a special case of workchain. It has notable differences:

- Shardchains in masterchain cannot be split or merged, so there is only one shardchain in it.

- Blocks in it contain additional important information:<br/>
  _ShardHashes_, a binary tree with a list of all defined shardchains along with the hashes of the latest block inside each of the
  listed shardchains. It is the inclusion of a shardchain block into this structure that makes a shardchain block _"canonical"_, and 
  enables other shardchains blocks to refer to data (e.g., outbound messages) contained in the shardchain block.

- The state of masterchain contains global configuration parameters of the whole TON blockchain, such as gas prices and other stuff.

> #### A little about shard id
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

### Accounts

...

### Messages

...

### Transactions

_Please refer to Chapter 4.2 of [the whitepaper]_

Transaction in TON describes the change of exactly one account.

#### Phases of an ordinary transaction

An ordinary transaction is performed in several _phases_:

- _Storage phase_ - collects due storage payments for the account state (including smart-contract code and data, if present) up to the
  present time. The smart contract may be _frozen_ as as result. 
  * If the smart contract did not exist before, the storage phase is skipped

- _Credit phase_ - The account is credited with the value of the inbound message received.
  * Skipped if the transaction was initiated by an external inbound message
  * Executed very first if the `bounce` flag was set to `false` in the incoming message

- _Computing phase_ - The code of the smart contract is invoked inside an instance of TVM with adequate parameters, including a copy of the
  inbound message and of the persistent data, and terminates with an exit code, the new persistent data, and an action list 
  (which includes, for instance, outbound messages to be sent). The processing phase may lead to the creation of a new account
  (uninitialized or active), or to the activation of a previously uninitialized or frozen account. The gas payment, equal to the product 
  of the gas price and the gas consumed, is exacted from the account balance.
  * Validators do not include a transaction into the network if it was generated by an external message and the exit code in this phase is 
    different from a successful one

- _Action phase_ - If the smart contract has terminated successfully (with exit code 0 or 1), the actions from the list are performed.
  If it is impossible to perform all of them then the transactions is aborted and the account state is rolled back. The transaction is also
  aborted if the smart contract did not terminate successfully, or if it was not possible to invoke the smart contract at all because it 
  is uninitialized or frozen.
  * Note the transaction may be included into the network even if it was generated by an external message (when the previous phase was
  successful). An included transaction means that fees will be deducted from the account balance even if rolled back.

- _Bounce phase_ - If the transaction has been aborted, and the inbound message has its `bounce` flag set, then it is "bounced" by
  automatically generating an outbound message (with the `bounce` flag clear, but `bounced` set) to its original sender.
  * Almost all value of the origin inbound message is transferred to the generated message
  * The message body is truncated to 256 data bits and 0 references 

...

[the whitepaper]: https://ton.org/tblkch.pdf
