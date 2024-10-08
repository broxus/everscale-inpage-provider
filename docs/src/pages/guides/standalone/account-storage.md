---
title: Everscale Inpage Provider
---

# Account Storage

Account Storage provides an abstraction layer over account management. This abstraction helps with securely managing accounts, as well as signing messages and transactions with the appropriate account. The `EverscaleStandaloneClient` requires an `AccountsStorage` for managing accounts and performing blockchain operations.

In this guide, we will explain what `AccountsStorage` is, how to use it with the `EverscaleStandaloneClient`, and how to manage the accounts using a `SimpleAccountsStorage`.

## Overview

`AccountsStorage` is an interface that contains the following properties and methods:

- `defaultAccount: Address | undefined`: The default account used for signing transactions and other blockchain operations.
- `getAccount(address: string | Address): Promise<Account | undefined>`: Retrieves an `Account` instance based on the provided address.

`Account` is another interface that contains the following properties and methods:

- `address: Address`: The account's address.
- `fetchPublicKey(ctx: AccountsStorageContext): Promise<string>`: Fetches the account's public key.
- `prepareMessage(args: PrepareMessageParams, ctx: AccountsStorageContext): Promise<nt.SignedMessage>`: Prepares and signs an external message to the account.

## Account Types

There are several types of accounts available in the `everscale-standalone-client` package. Each account type implements the `Account` interface and can be used with the `SimpleAccountsStorage`. Some of the available account types are:

- `GiverAccount`: An account that supports the Giver ABI (GiverV2, GiverV3).
- `GenericAccount`: A generic account that can be used with any ABI.
- `MsigAccount`: A multisig account (SafeMultisig, multisig2).
- `WalletV3Account`: A wallet account of version 3.
- `HighloadWalletV2`: A highload wallet account of version 2.
- `EverWalletAccount`: An EverWallet account.

## Creating a Custom Account

If the predefined account types provided by `everscale-standalone-client` do not fit your needs, it's possible to create a custom account type. To do so, you need to create a class that implements the `Account` interface.

```typescript
import {
  Account,
  AccountsStorageContext,
  PrepareMessageParams,
  Address,
} from 'everscale-standalone-client';

class CustomAccount implements Account {
  readonly address: Address;

  constructor(address: Address) {
    this.address = address;
  }

  async fetchPublicKey(ctx: AccountsStorageContext): Promise<string> {
    // Implement fetching public key logic here
  }

  async prepareMessage(
    args: PrepareMessageParams,
    ctx: AccountsStorageContext,
  ): Promise<nt.SignedMessage> {
    // Implement preparing message logic here
  }
}
```

You can add this custom account to your `SimpleAccountsStorage` in the same way as the predefined account types:

```typescript
const customAccount = new CustomAccount(/* ... */);
accountsStorage.addAccount(customAccount);
```

The `fetchPublicKey` and `prepareMessage` methods must be implemented according to your custom contract logic. `fetchPublicKey` is used to fetch the public key of the contract account, while `prepareMessage` is used to prepare and sign an external message for this account. The specifics of these methods depend on the particular functionalities of your contract and its interactions with the `AccountsStorageContext`.

## SimpleAccountsStorage

`SimpleAccountsStorage` is a class that implements the `AccountsStorage` interface. It provides basic functionality to manage accounts. It uses a map to store accounts based on their address.

Here's a list of its methods:

- `defaultAccount`: Getter and setter for the default account.
- `getAccount`: Retrieves an `Account` instance based on the address.
- `addAccount`: Adds an account to the storage.
- `hasAccount`: Checks if an account exists in the storage based on its address.
- `removeAccount`: Removes an account from the storage based on its address.

## Creating an instance of SimpleAccountsStorage

```typescript
import { SimpleAccountsStorage } from 'everscale-standalone-client';

const accountsStorage = new SimpleAccountsStorage();
```

To add a specific account type to the `SimpleAccountsStorage`, you need to create an instance of the account type and then use the `addAccount` method. For example:

```typescript
import { EverWalletAccount } from 'everscale-standalone-client';

const everWalletAccount = new EverWalletAccount(/* ... */);
accountsStorage.addAccount(everWalletAccount);
```

## Adding, Checking, and Removing Accounts

You can check if an account exists in the `SimpleAccountsStorage` using the `hasAccount` method, and you can remove accounts from the `SimpleAccountsStorage` using the `removeAccount` method. All these methods operate based on the account address.

```typescript
// Adding an account
accountsStorage.addAccount(account);

// Checking if an account exists
const exists = accountsStorage.hasAccount('address');

// Removing an account
accountsStorage.removeAccount('address');
```

## Retrieving an Account

```typescript
const account = await accountsStorage.getAccount('address');
if (account) {
  // Perform operations with the account
}
```

## Connecting SimpleAccountsStorage to Client

After setting up your `SimpleAccountsStorage`, you can now connect it to your `EverscaleStandaloneClient` instance:

```typescript
const provider = new ProviderRpcClient({
  fallback: () =>
    EverscaleStandaloneClient.create({
      connection: {
        // Connection configurations go here
      },
      accountsStorage: accountsStorage, // Add your accounts storage here
    }),
  forceUseFallback: true,
});
```
