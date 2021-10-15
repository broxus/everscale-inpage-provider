import { Transaction, TransactionsBatchInfo } from './models';
import { EventEmitter } from 'events'

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

  public equals(other: Address | string): boolean {
    if (other instanceof Address) {
      return this._address == other._address;
    } else {
      return this._address == other;
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

type CheckAddress<T extends string> = AddressImpl<T, Lowercase<T>>;

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
  info: TransactionsBatchInfo
): Transaction<Addr>[] {
  if (info.batchType == 'old') {
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
    knownTransactions[i].id.lt.localeCompare(info.maxLt) >= 0
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

type Handler = (...args: any[]) => void

interface EventMap {
  [k: string]: Handler | Handler[] | undefined
}

function safeApply<T, A extends any[]>(
  handler: (this: T, ...args: A) => void,
  context: T,
  args: A
): void {
  try {
    Reflect.apply(handler, context, args)
  } catch (err) {
    // Throw error after timeout so as not to interrupt the stack
    setTimeout(() => {
      throw err
    })
  }
}

function arrayClone<T>(arr: T[]): T[] {
  const n = arr.length
  const copy = new Array(n)
  for (let i = 0; i < n; i += 1) {
    copy[i] = arr[i]
  }
  return copy
}

export class SafeEventEmitter extends EventEmitter {
  emit(type: string, ...args: any[]): boolean {
    let doError = type === 'error'

    const events: EventMap = (this as any)._events
    if (events !== undefined) {
      doError = doError && events.error === undefined
    } else if (!doError) {
      return false
    }

    if (doError) {
      let er
      if (args.length > 0) {
        ;[er] = args
      }
      if (er instanceof Error) {
        throw er
      }

      const err = new Error(`Unhandled error.${er ? ` (${er.message})` : ''}`)
      ;(err as any).context = er
      throw err
    }

    const handler = events[type]

    if (handler === undefined) {
      return false
    }

    if (typeof handler === 'function') {
      safeApply(handler, this, args)
    } else {
      const len = handler.length
      const listeners = arrayClone(handler)
      for (let i = 0; i < len; i += 1) {
        safeApply(listeners[i], this, args)
      }
    }

    return true
  }
}
