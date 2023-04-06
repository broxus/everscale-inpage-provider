# Provider

## Table of Contents

<!-- ### Interfaces -->

### Interfaces

- EverscaleProvider
- EverscaleProviderException

### Classes

- Contract
- Initialize
- Subscribe
- Unsubscribe
- RequestPermissions
- GetPermissions
- RevokePermissions

### Types

- Address
- Abi
- Transaction

### Methods

#### Provider State & Permissions

- GetProviderState
- GetBalance
- GetFullContractState
- GetAccountsByCodeHash

#### Transactions

- GetTransactions
- GetTransaction
- SendMessage
- SendMessageDelayed
- ProcessMessage
- ProcessMessageLocal
- WaitForTransaction

#### Contract & Data Handling

- GetExpectedAddress
- GetStateInit
- UnpackInitData
- GetBocHash
- PackIntoCell
- UnpackFromCell
- ExtractPublicKey
- CodeToTvc
- MergeTvc
- SplitTvc
- SetCodeSalt
- GetCodeSalt
- AddAsset

#### Cryptography & Security

- VerifySignature
- SignData
- SignDataRaw
- EncryptData
- DecryptData

#### Execution & Fee Estimation

- RunTvm
- RunExecutor
- EstimateFees
- ParseTransaction

### Events

- Connect
- Disconnect
- AccountsChanged
- ChainChanged
- Message

### Errors

- EverscaleProviderException

### Using the Inpage Provider

### [Type Aliases](#Types)

<Suspense>
  <TypeAliasComponent  />
</Suspense>

### [Interfaces](#Interfaces)

<Suspense>
  <InterfaceComponent />
</Suspense>

### [Classes](#Classes)

<Suspense>
  <ClassComponent />
</Suspense>
