---
title: Everscale Inpage Provider
outline: deep
---

# Cryptography & Security

This guide provides an overview of the cryptographic concepts, methods, and best practices for secure and efficient implementation in TVM-compatible blockchains when using the Everscale Inpage Provider.

## Encryption and Decryption

The Everscale Inpage Provider supports encryption and decryption methods that enable users to securely protect and access their data. Encryption converts plaintext data into ciphertext, which can only be read by someone with the correct decryption key. Decryption reverses this process, turning ciphertext back into plaintext.

The following encryption and decryption methods are supported:

- `encryptData`: Encrypts arbitrary data using the specified algorithm for each recipient.
- `decryptData`: Decrypts encrypted data for the current account.

```typescript
import { Base64 } from 'js-base64';

// Data to be encrypted
const data = 'encrypt-test-42';

const encryptedDataList = await provider.encryptData({
  publicKey: publicKey,
  recipientPublicKeys: [publicKey],
  algorithm: 'ChaCha20Poly1305',
  data: Base64.encode(data), // Base64 encoded arbitrary bytes
});

const encryptedData = encryptedDataList[0];
console.log(`Encrypted data:`, encryptedData);

// Decrypt data
const decryptedData = await provider.decryptData(encryptedData);
console.log(`Decrypted data:`, decryptedData);
```

<EncryptDecryptComponent />

## Signatures and Verification

Digital signatures are a cryptographic mechanism that allows users to prove the authenticity of a message or document. In blockchain, digital signatures are used to sign transactions, ensuring that only the holder of the private key can authorize operations on the blockchain.

The provider supports the following methods for signing and verifying data:

- `signData`: Signs arbitrary data after hashing it.
- `signDataRaw`: Signs arbitrary data without hashing it.
- `verifySignature`: Verifies a signature against the provided public key and data.

### Sign data

When signing data using the `signData` method, the data is first hashed before being signed. This is useful when you want to ensure the integrity of the data being signed. The `signDataRaw` method, on the other hand, signs the data directly without hashing it. This can be useful if you need to sign data that doesn't require hashing or in cases where the data has already been hashed.

```typescript
import { Base64 } from 'js-base64';

// Data to be signed
const data = 'example42';

// Sign data with hashing
const signedData = await provider.signData({
  publicKey: publicKey,
  data: Base64.encode(data),
});

console.log(`Signed data:`, signedData);

// Signs data without hashing
const signedDataRaw = await provider.signDataRaw({
  publicKey: publicKey,
  data: Base64.encode(data),
});

console.log(`Signed data (raw):`, signedDataRaw);
```

<SignDataComponent />

### Verify signature

To verify a signature, you need to use the correct input depending on the signing method. If the data was signed with `signData`, you should use the `dataHash` returned by the method. If it was signed with `signDataRaw`, you should either use the hash of the original data (if you want to verify the signature against hashed data) or the original data itself (if you want to verify the signature against raw data).

```typescript
// Signature data
const publicKey =
  'fbe51100154bc12d9269905d2f9aaaea75588ab439a8f911fd5a2adeb6d2b5a7';
const signature =
  'L+QYhOjZNVJXcOQFa6nb7ELPenwX3VQBibZVxjmis+k+fA/E3G0thKL/98+klD6swljMHwB/PMirIinoVYw9Cg==';

const dataHash =
  '9d2157c26e70bd16e3b70f7fb4373dc1d1aedddf24efcbf27234597b40bf277e';

// Verify signature
const isValid = await provider.verifySignature({
  publicKey: publicKey,
  signature: signature,
  dataHash: dataHash,
});

console.log(`Signature is valid:`, isValid.isValid);
```

<VerifySignComponent />

::: info
Please note that a `false` result will be returned only if the data in the signature does not match the data provided. If you use an incorrect data type, however, you may encounter an error. Make sure you use the correct data corresponding to the signing method you used and ensure that the data type is appropriate for the verification process.
:::
