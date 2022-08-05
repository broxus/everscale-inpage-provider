import { Transaction, TransactionsBatchInfo } from './models';

/**
 * @category Utils
 */
export type UniqueArray<T> = T extends readonly [infer X, ...infer Rest]
  ? InArray<Rest, X> extends true
    ? ['Encountered value with duplicates:', X]
    : readonly [X, ...UniqueArray<Rest>]
  : T

/**
 * @category Utils
 */
export type InArray<T, X> = T extends readonly [X, ...infer _Rest]
  ? true
  : T extends readonly [X]
    ? true
    : T extends readonly [infer _, ...infer Rest]
      ? InArray<Rest, X>
      : false

/**
 * @category Utils
 */
export type ArrayItemType<T extends readonly unknown[]> = T extends readonly (infer Ts)[] ? Ts : never;

/**
 * @category Utils
 */
export class Address {
  private readonly _address: string;

  constructor(address: string) {
    this._address = address;
  }

  public toString(): string {
    return this._address;
  }

  public toJSON(): string {
    return this._address;
  }

  public equals = (other: Address | string): boolean => this._equals(other);

  private _equals(other: Address | string): boolean {
    if (other instanceof Address) {
      return this._address === other._address;
    } else {
      return this._address === other;
    }
  }
}

/**
 * @category Utils
 */
export class AddressLiteral<T extends string> extends Address {
  constructor(address: CheckAddress<T>) {
    super(address);
  }
}

/**
 * @category Utils
 */
export type CheckAddress<T extends string> = AddressImpl<T, Lowercase<T>>;

type AddressPrefix = '0:' | '-1:'
type AddressImpl<T, Tl extends string> = Tl extends `${AddressPrefix}${infer Hash}`
  ? true extends IsHexString<Hash, []>
    ? T : never
  : never;

type HexSymbol = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f'
type HexByte = `${HexSymbol}${HexSymbol}`
type IsHexString<T extends string, L extends readonly number[]> =
  T extends `${HexByte}${infer Tail}`
    ? IsHexString<Tail, [...L, 0]>
    : T extends '' ? L['length'] extends 32 ? true : never : never

/**
 * @category Utils
 */
export class MessageExpiredException extends Error {
  constructor(public readonly address: Address, public readonly hash: string) {
    super('Message expired');
  }
}

export class DelayedTransactions {
  private readonly transactions: Map<string, {
    promise: Promise<Transaction | undefined>,
    resolve: (transaction?: Transaction) => void,
    reject: () => void,
  }> = new Map();

  public async waitTransaction(address: Address, hash: string): Promise<Transaction> {
    let transaction = this.transactions.get(hash)?.promise;
    if (transaction == null) {
      let resolve: (transaction?: Transaction) => void;
      let reject: () => void;
      transaction = new Promise<Transaction | undefined>((promiseResolve, promiseReject) => {
        resolve = (tx) => promiseResolve(tx);
        reject = () => promiseReject();
      });
      this.transactions.set(hash, {
        promise: transaction,
        resolve: resolve!,
        reject: reject!,
      });
    }

    const tx = await transaction;
    if (tx == null) {
      throw new MessageExpiredException(address, hash);
    }
    return tx;
  }

  public fillTransaction(hash: string, transaction?: Transaction) {
    const pendingTransaction = this.transactions.get(hash);
    if (pendingTransaction != null) {
      pendingTransaction.resolve(transaction);
    } else {
      this.transactions.set(hash, {
        promise: Promise.resolve(transaction),
        resolve: () => { /* do nothing */
        },
        reject: () => { /* do nothing */
        },
      });
    }
  }
}

/**
 * @category Utils
 */
export const LT_COLLATOR: Intl.Collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/**
 * Modifies knownTransactions array, merging it with new transactions.
 * All arrays are assumed to be sorted by descending logical time.
 *
 * > Note! This method does not remove duplicates.
 *
 * @param knownTransactions
 * @param newTransactions
 * @param info
 *
 * @category Utils
 */
export function mergeTransactions<Addr>(
  knownTransactions: Transaction<Addr>[],
  newTransactions: Transaction<Addr>[],
  info: TransactionsBatchInfo,
): Transaction<Addr>[] {
  if (info.batchType === 'old') {
    knownTransactions.push(...newTransactions);
    return knownTransactions;
  }

  if (knownTransactions.length === 0) {
    knownTransactions.push(...newTransactions);
    return knownTransactions;
  }

  // Example:
  // known lts: [N, N-1, N-2, N-3, (!) N-10,...]
  // new lts: [N-4, N-5]
  // batch info: { minLt: N-5, maxLt: N-4, batchType: 'new' }

  // 1. Skip indices until known transaction lt is greater than the biggest in the batch
  let i = 0;
  while (
    i < knownTransactions.length &&
    LT_COLLATOR.compare(knownTransactions[i].id.lt, info.maxLt) >= 0
    ) {
    ++i;
  }

  // 2. Insert new transactions
  knownTransactions.splice(i, 0, ...newTransactions);
  return knownTransactions;
}

const MAX = 4294967295;

let idCounter = Math.floor(Math.random() * MAX);

export function getUniqueId(): number {
  idCounter = (idCounter + 1) % MAX;
  return idCounter;
}
