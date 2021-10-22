import { Mutex } from '@broxus/await-semaphore';
import * as nt from 'nekoton-wasm';

import { ConnectionController } from './connectionController';
import { ContractSubscription, IContractHandler } from './subscription';
import { ContractUpdatesSubscription } from '../models';
import { ProviderEvent, RawProviderEventData } from '../api';

const DEFAULT_POLLING_INTERVAL = 10000; // 10s

export class SubscriptionController {
  private readonly _connectionController: ConnectionController;
  private readonly _notify: <T extends ProviderEvent>(method: T, params: RawProviderEventData<T>) => void;

  private readonly _subscriptions: Map<string, ContractSubscription> = new Map();
  private readonly _subscriptionsMutex: Mutex = new Mutex();
  private readonly _sendMessageRequests: Map<string, Map<string, SendMessageCallback>> = new Map();
  private readonly _subscriptionStates: Map<string, ContractUpdatesSubscription> = new Map();

  constructor(connectionController: ConnectionController, notify: <T extends ProviderEvent>(method: T, params: RawProviderEventData<T>) => void) {
    this._connectionController = connectionController;
    this._notify = notify;
  }

  public async subscribeToContract(address: string, params: Partial<ContractUpdatesSubscription>): Promise<ContractUpdatesSubscription> {
    return this._subscriptionsMutex.use(async () => {
      let shouldUnsubscribe = true;

      const currentParams = this._subscriptionStates.get(address) || makeDefaultSubscriptionState();
      Object.keys(currentParams).map((param) => {
        if (param !== 'state' && param !== 'transactions') {
          throw new Error(`Unknown subscription topic: ${param}`);
        }

        const value = params[param];
        if (typeof value === 'boolean') {
          currentParams[param] = value;
        } else {
          throw new Error(`Unknown subscription topic value: ${value}`);
        }

        shouldUnsubscribe &&= !currentParams[param];
      });

      if (shouldUnsubscribe) {
        this._subscriptionStates.delete(address);
        await this._tryUnsubscribe(address);
        return { ...currentParams };
      }

      let existingSubscription = this._subscriptions.get(address);
      const isNewSubscription = existingSubscription == null;
      if (isNewSubscription) {
        existingSubscription = await this._createSubscription(address);
      }

      this._subscriptionStates.set(address, currentParams);

      if (existingSubscription) {
        await existingSubscription.start();
      }
      return { ...currentParams };
    });
  }

  public async unsubscribeFromContract(address: string) {
    await this.subscribeToContract(address, {
      state: false,
      transactions: false,
    });
  }

  public async unsubscribeFromAllContracts() {
    const subscriptions = Array.from(this._subscriptions.keys());
    for (const address of subscriptions) {
      await this.unsubscribeFromContract(address);
    }
  }

  public get subscriptionStates(): { [address: string]: ContractUpdatesSubscription } {
    return [...this._subscriptionStates].reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {} as { [address: string]: ContractUpdatesSubscription });
  }

  private async _createSubscription(address: string) {
    class ContractHandler implements IContractHandler<nt.Transaction> {
      private readonly _address: string;
      private readonly _controller: SubscriptionController;
      private _enabled: boolean = false;

      constructor(address: string, controller: SubscriptionController) {
        this._address = address;
        this._controller = controller;
      }

      public enabledNotifications() {
        this._enabled = true;
      }

      onMessageExpired(pendingTransaction: nt.PendingTransaction) {
        if (this._enabled) {
          this._controller
            ._rejectMessageRequest(this._address, pendingTransaction.bodyHash, new Error(`Message expired`))
            .catch(console.error);
        }
      }

      onMessageSent(pendingTransaction: nt.PendingTransaction, transaction: nt.Transaction) {
        if (this._enabled) {
          this._controller
            ._resolveMessageRequest(this._address, pendingTransaction.bodyHash, transaction)
            .catch(console.error);
        }
      }

      onStateChanged(newState: nt.ContractState) {
        if (this._enabled) {
          this._controller._notifyStateChanged(this._address, newState);
        }
      }

      onTransactionsFound(transactions: Array<nt.Transaction>, info: nt.TransactionsBatchInfo) {
        if (this._enabled) {
          this._controller._notifyTransactionsFound(this._address, transactions, info);
        }
      }
    }

    const handler = new ContractHandler(address, this);

    const subscription = await ContractSubscription.subscribe(this._connectionController, address, handler);
    subscription.setPollingInterval(DEFAULT_POLLING_INTERVAL);
    handler.enabledNotifications();

    this._subscriptions.set(address, subscription);

    return subscription;
  }

  private async _tryUnsubscribe(address: string) {
    const subscriptionState = this._subscriptionStates.get(address);
    const sendMessageRequests = this._sendMessageRequests.get(address);
    if (subscriptionState == null && (sendMessageRequests?.size || 0) == 0) {
      const subscription = this._subscriptions.get(address);
      this._subscriptions.delete(address);
      await subscription?.stop();
    }
  }

  private async _rejectMessageRequest(address: string, id: string, error: Error) {
    this._deleteMessageRequestAndGetCallback(address, id).reject(error);
    await this._subscriptionsMutex.use(async () => this._tryUnsubscribe(address));
  }

  private async _resolveMessageRequest(address: string, id: string, transaction: nt.Transaction) {
    this._deleteMessageRequestAndGetCallback(address, id).resolve(transaction);
    await this._subscriptionsMutex.use(async () => this._tryUnsubscribe(address));
  }

  private _notifyStateChanged(address: string, state: nt.ContractState) {
    const subscriptionState = this._subscriptionStates.get(address);
    if (subscriptionState?.state) {
      this._notify('contractStateChanged', {
        address,
        state,
      });
    }
  }

  private _notifyTransactionsFound(address: string, transactions: nt.Transaction[], info: nt.TransactionsBatchInfo) {
    const subscriptionState = this._subscriptionStates.get(address);
    if (subscriptionState?.transactions) {
      this._notify('transactionsFound', {
        address,
        transactions,
        info,
      });
    }
  }

  private _deleteMessageRequestAndGetCallback(address: string, id: string): SendMessageCallback {
    const callbacks = this._sendMessageRequests.get(address)?.get(id);
    if (!callbacks) {
      throw new Error(`SendMessage request with id '${id}' not found`);
    }

    this._deleteMessageRequest(address, id);
    return callbacks;
  }

  private _deleteMessageRequest(address: string, id: string) {
    const accountMessageRequests = this._sendMessageRequests.get(address);
    if (!accountMessageRequests) {
      return;
    }
    accountMessageRequests.delete(id);
    if (accountMessageRequests.size == 0) {
      this._sendMessageRequests.delete(address);
    }
  }
}

const makeDefaultSubscriptionState = (): ContractUpdatesSubscription => ({
  state: false,
  transactions: false,
});

export type SendMessageCallback = {
  resolve: (transaction: nt.Transaction) => void;
  reject: (error?: Error) => void;
};
