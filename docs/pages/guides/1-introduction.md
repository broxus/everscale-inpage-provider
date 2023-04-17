# Introduction

This library seeks to be a powerful tool for building web3 applications that work with TON-compatible blockchains.
It helps you build statically type checked contract interaction, pack/unpack complex cell data structures or write
elegant transaction parsers using streams and a bunch of combinators.

It is a generalized interface around an object that is injected into the page by various extensions or programs. In case when none of
providers are installed (or you are in the NodeJS environment), you can
use [`everscale-standalone-client`](https://github.com/broxus/everscale-standalone-client).
It only supports methods that do not require user interaction (and its implementation is loaded only when it is used, so the size of the
resulting bundle is not very large).
