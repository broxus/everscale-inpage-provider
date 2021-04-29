import {ContractType} from "./models";

export interface Permissions {
    tonClient: true,
    accountInteraction: AccountInteractionItem[]
}

export interface AccountInteractionItem {
    address: string
    publicKey: string
    contractType: ContractType
}

export type Permission = keyof Permissions
export type PermissionData<T extends Permission> = Permissions[T]
