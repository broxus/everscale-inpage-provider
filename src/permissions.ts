import { WalletContractType } from './models';

export interface Permissions {
  tonClient: true,
  accountInteraction: {
    address: string
    publicKey: string
    contractType: WalletContractType
  }
}

export type Permission = keyof Permissions
export type PermissionData<T extends Permission> = Permissions[T]
