import { Mutex } from '@broxus/await-semaphore';
import * as nt from 'nekoton-wasm';

import { GqlSocket, GqlSocketParams } from './gql';

export const DEFAULT_NETWORK_GROUP = 'mainnet';

const NETWORK_PRESETS: { [presetId: number]: ConnectionData } = {
  [0]: {
    name: 'Mainnet (GQL 1)',
    group: 'mainnet',
    type: 'graphql',
    data: {
      endpoint: 'https://main.ton.dev/graphql',
      timeout: 60000,
      local: false,
    },
  } as ConnectionData,
  [1]: {
    name: 'Mainnet (GQL 2)',
    group: 'mainnet',
    type: 'graphql',
    data: {
      endpoint: 'https://main2.ton.dev/graphql',
      timeout: 60000,
      local: false,
    },
  } as ConnectionData,
  [2]: {
    name: 'Mainnet (GQL 3)',
    group: 'mainnet',
    type: 'graphql',
    data: {
      endpoint: 'https://main3.ton.dev/graphql',
      timeout: 60000,
      local: false,
    },
  } as ConnectionData,
  [4]: {
    name: 'Testnet',
    group: 'testnet',
    type: 'graphql',
    data: {
      endpoint: 'https://net.ton.dev/graphql',
      timeout: 60000,
      local: false,
    },
  } as ConnectionData,
  [5]: {
    name: 'fld.ton.dev',
    group: 'fld',
    type: 'graphql',
    data: {
      endpoint: 'https://gql.custler.net/graphql',
      timeout: 60000,
      local: false,
    },
  } as ConnectionData,
  [100]: {
    name: 'Local node',
    group: 'localnet',
    type: 'graphql',
    data: {
      endpoint: 'http://127.0.0.1/graphql',
      timeout: 60000,
      local: true,
    },
  } as ConnectionData,
};

/**
 * @category Client
 */
export type TonClientConnectionProperties = {
  /**
   * Target network group.
   *
   * Will be `mainnet` if not specified
   */
  networkGroup?: string;
  /**
   * Target preset id.
   *
   * **NOTE:** `networkGroup` is ignored if preset id is specified
   */
  presetId?: number;
  /**
   * Additional network configurations.
   *
   * **NOTE**: object must contain unique preset ids. To be sure that they do not overlap with existing presets,
   * use IDs starting from 1000
   */
  additionalPresets?: { [presetId: number]: ConnectionData }
};

export async function createConnectionController(params: TonClientConnectionProperties): Promise<ConnectionController> {
  const presets: typeof NETWORK_PRESETS = { ...NETWORK_PRESETS };

  // Extend presets with additional presets
  if (params.additionalPresets != null) {
    for (const [key, value] of Object.entries(params.additionalPresets)) {
      const mappedPresets = presets as { [key: string]: ConnectionData };
      if (mappedPresets[key]) {
        throw new Error(`Connection preset with id ${key} already exists`);
      }
      mappedPresets[key] = value;
    }
  }

  // Select presets
  let availablePresets: ConnectionData[];
  if (params.presetId != null) {
    const targetPreset = presets[params.presetId] as ConnectionData | undefined;
    if (targetPreset == null) {
      throw new Error(`Target preset id not found: ${params.presetId}`);
    }
    availablePresets = [targetPreset];
  } else {
    availablePresets = selectPresetsByGroup(presets, params.networkGroup || DEFAULT_NETWORK_GROUP);
  }

  console.debug('Available presets:', availablePresets);

  // Try connect
  while (true) {
    try {
      for (const preset of availablePresets) {
        console.debug(`Connecting to ${preset.name} ...`);

        try {
          const controller = new ConnectionController();
          await controller.startSwitchingNetwork(preset).then((handle) => handle.switch());
          console.log(`Successfully connected to ${preset.name}`);
          return controller;
        } catch (e: any) {
          console.error('Connection failed:', e);
        }
      }
    } catch (_e) {
      console.error('Failed to select initial connection. Retrying in 5s');
    }

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 5000);
    });
    console.log('Restarting connection process');
  }
}

export class ConnectionController {
  private _initializedTransport?: InitializedTransport;
  private _networkMutex: Mutex = new Mutex();
  private _release?: () => void;
  private _acquiredTransportCounter: number = 0;
  private _cancelTestTransport?: () => void;

  public async acquire() {
    requireInitializedTransport(this._initializedTransport);
    await this._acquireTransport();

    return {
      transport: this._initializedTransport,
      release: () => this._releaseTransport(),
    };
  }

  public async use<T>(f: (transport: InitializedTransport) => Promise<T>): Promise<T> {
    requireInitializedTransport(this._initializedTransport);
    await this._acquireTransport();

    return f(this._initializedTransport)
      .finally(() => {
        this._releaseTransport();
      });
  }

  public async startSwitchingNetwork(params: ConnectionData): Promise<INetworkSwitchHandle> {
    class NetworkSwitchHandle implements INetworkSwitchHandle {
      private readonly _controller: ConnectionController;
      private readonly _release: () => void;
      private readonly _params: ConnectionData;

      constructor(
        controller: ConnectionController,
        release: () => void,
        params: ConnectionData,
      ) {
        this._controller = controller;
        this._release = release;
        this._params = params;
      }

      public async switch() {
        await this._controller
          ._connect(this._params)
          .finally(() => this._release());
      }
    }

    this._cancelTestTransport?.();

    const release = await this._networkMutex.acquire();
    return new NetworkSwitchHandle(this, release, params);
  }

  public get currentConnectionGroup(): string | undefined {
    return this._initializedTransport?.group;
  }

  private async _connect(params: ConnectionData) {
    if (this._initializedTransport) {
      this._initializedTransport.data.transport.free();
    }
    this._initializedTransport = undefined;

    enum TestConnectionResult {
      DONE,
      CANCELLED,
    }

    const testTransport = async ({ data: { transport } }: InitializedTransport): Promise<TestConnectionResult> => {
      return new Promise<TestConnectionResult>((resolve, reject) => {
        this._cancelTestTransport = () => resolve(TestConnectionResult.CANCELLED);

        // Try to get any account state
        transport
          .getFullContractState(
            '-1:0000000000000000000000000000000000000000000000000000000000000000',
          )
          .then(() => resolve(TestConnectionResult.DONE))
          .catch((e) => reject(e));

        setTimeout(() => reject(new Error('Connection timeout')), 10000);
      }).finally(() => this._cancelTestTransport = undefined);
    };

    try {
      // TODO: add jrpc transport
      const { shouldTest, transportData } = await (async () => {
        const socket = new GqlSocket();
        const transport = await socket.connect(params.data);

        return {
          shouldTest: !params.data.local,
          transport,
          transportData: {
            group: params.group,
            type: 'graphql',
            data: {
              socket,
              transport,
            },
          } as InitializedTransport,
        };
      })();

      if (shouldTest && (await testTransport(transportData)) == TestConnectionResult.CANCELLED) {
        transportData.data.transport.free();
        return;
      }

      this._initializedTransport = transportData;
    } catch (e: any) {
      throw new Error(`Failed to create connection: ${e.toString()}`);
    }
  }

  private async _acquireTransport() {
    console.debug('_acquireTransport');

    if (this._acquiredTransportCounter > 0) {
      console.debug('_acquireTransport -> increase');
      this._acquiredTransportCounter += 1;
    } else {
      this._acquiredTransportCounter = 1;
      if (this._release != null) {
        console.warn('mutex is already acquired');
      } else {
        console.debug('_acquireTransport -> await');
        this._release = await this._networkMutex.acquire();
        console.debug('_acquireTransport -> create');
      }
    }
  }

  private _releaseTransport() {
    console.debug('_releaseTransport');

    this._acquiredTransportCounter -= 1;
    if (this._acquiredTransportCounter <= 0) {
      console.debug('_releaseTransport -> release');
      this._release?.();
      this._release = undefined;
    }
  }
}

interface INetworkSwitchHandle {
  // Must be called after all connection usages are gone
  switch(): Promise<void>;
}

const selectPresetsByGroup = (presets: { [presetId: number]: ConnectionData }, group: string): ConnectionData[] =>
  Object.values(presets).filter(item => item.group == group);

function requireInitializedTransport(transport?: InitializedTransport): asserts transport is InitializedTransport {
  if (transport == null) {
    throw new Error('Connection is not initialized');
  }
}

export type ConnectionData = { name: string; group: string } & (
  | nt.EnumItem<'graphql', GqlSocketParams>
  )

export type InitializedTransport = { group: string } & (
  | nt.EnumItem<'graphql', { socket: GqlSocket, transport: nt.GqlTransport }>
  )
