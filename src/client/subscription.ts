import { Mutex } from '@broxus/await-semaphore';
import * as nt from 'nekoton-wasm';

import { ConnectionController } from './connectionController';

export class ContractSubscription {
  private readonly _transport: Transport;
  private readonly _address: string;
  private readonly _contract: nt.GenericContract;
  private readonly _contractMutex: Mutex = new Mutex();
  private _releaseTransport?: () => void;
  private _loopPromise?: Promise<void>;
  private _refreshTimer?: [number, () => void];
  private _pollingInterval: number = BACKGROUND_POLLING_INTERVAL;
  private _currentPollingMethod: nt.PollingMethod;
  private _isRunning: boolean = false;
  private _currentBlockId?: string;
  private _suggestedBlockId?: string;

  public static async subscribe(connectionController: ConnectionController, address: string, handler: IContractHandler<nt.Transaction>) {
    const {
      transport: { data: { transport } },
      release,
    } = await connectionController.acquire();

    try {
      const contract = await transport.subscribeToGenericContract(address, handler);
      if (contract == null) {
        throw new Error(`Failed to subscribe to contract: ${address}`);
      }
      return new ContractSubscription(transport, release, address, contract);
    } catch (e: any) {
      release();
      throw e;
    }
  }

  private constructor(transport: Transport, release: () => void, address: string, contract: nt.GenericContract) {
    this._transport = transport;
    this._address = address;
    this._contract = contract;
    this._releaseTransport = release;
    this._currentPollingMethod = contract.pollingMethod;
  }

  public setPollingInterval(interval: number) {
    this._pollingInterval = interval;
  }

  public async start() {
    if (this._releaseTransport == null) {
      throw new Error('Contract subscription must not be started after being closed');
    }

    if (this._loopPromise) {
      console.debug('ContractSubscription -> awaiting loop promise');
      await this._loopPromise;
    }

    console.debug('ContractSubscription -> loop started');

    this._loopPromise = new Promise<void>(async (resolve) => {
      const isSimpleTransport = !(this._transport instanceof nt.GqlTransport);

      this._isRunning = true;
      let previousPollingMethod = this._currentPollingMethod;
      while (this._isRunning) {
        const pollingMethodChanged = previousPollingMethod != this._currentPollingMethod;
        previousPollingMethod = this._currentPollingMethod;

        if (isSimpleTransport || this._currentPollingMethod == 'manual') {
          this._currentBlockId = undefined;

          console.debug('ContractSubscription -> manual -> waiting begins');

          const pollingInterval =
            this._currentPollingMethod == 'manual'
              ? this._pollingInterval
              : INTENSIVE_POLLING_INTERVAL;

          await new Promise<void>((resolve) => {
            const timerHandle = window.setTimeout(() => {
              this._refreshTimer = undefined;
              resolve();
            }, pollingInterval);
            this._refreshTimer = [timerHandle, resolve];
          });

          console.debug('ContractSubscription -> manual -> waiting ends');

          if (!this._isRunning) {
            break;
          }

          console.debug('ContractSubscription -> manual -> refreshing begins');

          try {
            this._currentPollingMethod = await this._contractMutex.use(async () => {
              await this._contract.refresh();
              return this._contract.pollingMethod;
            });
          } catch (e: any) {
            console.error(`Error during account refresh (${this._address})`, e);
          }

          console.debug('ContractSubscription -> manual -> refreshing ends');
        } else {
          // SAFETY: connection is always GqlConnection here due to `isSimpleTransport`
          const transport = this._transport as nt.GqlTransport;

          console.debug('ContractSubscription -> reliable start');

          if (pollingMethodChanged && this._suggestedBlockId != null) {
            this._currentBlockId = this._suggestedBlockId;
          }
          this._suggestedBlockId = undefined;

          let nextBlockId: string;
          if (this._currentBlockId == null) {
            console.warn('Starting reliable connection with unknown block');

            try {
              const latestBlock = await transport.getLatestBlock(this._address);
              this._currentBlockId = latestBlock.id;
              nextBlockId = this._currentBlockId;
            } catch (e: any) {
              console.error(`Failed to get latest block for ${this._address}`, e);
              continue;
            }
          } else {
            try {
              nextBlockId = await transport.waitForNextBlock(
                this._currentBlockId,
                this._address,
                NEXT_BLOCK_TIMEOUT,
              );
            } catch (e: any) {
              console.error(`Failed to wait for next block for ${this._address}`);
              continue; // retry
            }
          }

          try {
            this._currentPollingMethod = await this._contractMutex.use(async () => {
              await this._contract.handleBlock(nextBlockId);
              return this._contract.pollingMethod;
            });
            this._currentBlockId = nextBlockId;
          } catch (e: any) {
            console.error(`Failed to handle block for ${this._address}`, e);
          }
        }
      }

      console.debug('ContractSubscription -> loop finished');

      resolve();
    });
  }

  public skipRefreshTimer() {
    window.clearTimeout(this._refreshTimer?.[0]);
    this._refreshTimer?.[1]();
    this._refreshTimer = undefined;
  }

  public async pause() {
    if (!this._isRunning) {
      return;
    }

    this._isRunning = false;

    this.skipRefreshTimer();

    await this._loopPromise;
    this._loopPromise = undefined;

    this._currentPollingMethod = await this._contractMutex.use(async () => {
      return this._contract.pollingMethod;
    });

    this._currentBlockId = undefined;
    this._suggestedBlockId = undefined;
  }

  public async stop() {
    await this.pause();
    this._contract.free();
    this._releaseTransport?.();
    this._releaseTransport = undefined;
  }

  public async prepareReliablePolling() {
    try {
      if (this._transport instanceof nt.GqlTransport) {
        this._suggestedBlockId = (await this._transport.getLatestBlock(this._address)).id;
      }
    } catch (e: any) {
      throw new Error(`Failed to prepare reliable polling: ${e.toString()}`);
    }
  }

  public async use<T>(f: (contract: nt.GenericContract) => Promise<T>) {
    const release = await this._contractMutex.acquire();
    return f(this._contract)
      .then((res) => {
        release();
        return res;
      })
      .catch((err) => {
        release();
        throw err;
      });
  }
}

export interface IContractHandler<T extends nt.Transaction> {
  onMessageSent(pendingTransaction: nt.PendingTransaction, transaction: nt.Transaction): void;

  onMessageExpired(pendingTransaction: nt.PendingTransaction): void;

  onStateChanged(newState: nt.ContractState): void;

  onTransactionsFound(transactions: Array<T>, info: nt.TransactionsBatchInfo): void;
}

type Transport = nt.GqlTransport;

const NEXT_BLOCK_TIMEOUT = 60; // 60s
const INTENSIVE_POLLING_INTERVAL = 2000; // 2s
const BACKGROUND_POLLING_INTERVAL: number = 60000;
