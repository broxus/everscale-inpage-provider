---
title: Everscale Inpage Provider
---

# Everscale Inpage Provider

The Inpage Provider's main features include:

- Provider: a class for interacting with the blockchain. It manages the connection and provides methods for sending requests, listening to events, and managing listeners.
- Contract and Subscriber: utilities for creating smart contract instances and managing event subscriptions. The Contract class allows developers to easily create and interact with smart contracts, while the Subscriber class allows them to manage subscriptions to various events.
- Utility functions: various auxiliary functions for working with addresses, tokens, transactions, and other data. They are necessary for processing and formatting data used in the ecosystem.
- Event handling: the ability for web applications to subscribe to various events related to the blockchain. This includes events such as connected, disconnected, transactionsFound, contractStateChanged, messageStatusUpdated, networkChanged, permissionsChanged, and loggedOut.
- Permissions management: methods for requesting, changing, and revoking permissions related to account interactions and other blockchain-related actions.

The Inpage Provider library plays an important role in the Everscale ecosystem by simplifying the process of integrating Everscale-based functionality into web applications. The documentation covers the key aspects of each module in detail to help developers better understand their functionality and potential use cases in their projects.

## Table of Contents

- [provider](provider.md#Provider): the main file that combines all modules into one library.
- [provider-api](provider-api.md#provider-api): describes the API class for sending requests to the server and interacting with the blockchain.
- [models](models.md#models) : defines the main data structures, such as transactions and smart contracts.
- [contract](contract.md#contract): contains functionality for working with smart contracts, including their creation and submission.
- [stream](stream.md#stream): implements functionality for working with transaction streams and events.
- [utils](utils.md#utils): auxiliary functions and classes needed for library operation.
