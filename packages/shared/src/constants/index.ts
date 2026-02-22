export const APP_NAME = "Kebo"
export const APP_VERSION = "1.0.0"

// Account Type IDs
export enum AccountTypeId {
  CUENTA_CORRIENTE = "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  CUENTA_AHORRO = "aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  TARJETA_CREDITO = "aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  EFECTIVO = "fdcdbb05-9591-4afe-9fa1-8bdea8d65e07",
}

// Account Types with full details
export const ACCOUNT_TYPES = [
  {
    id: AccountTypeId.CUENTA_CORRIENTE,
    type_name: "Cuenta Corriente",
    description: "Cuenta corriente estándar",
  },
  {
    id: AccountTypeId.CUENTA_AHORRO,
    type_name: "Cuenta de Ahorro",
    description: "Cuenta de ahorro estándar",
  },
  {
    id: AccountTypeId.TARJETA_CREDITO,
    type_name: "Tarjeta de Crédito",
    description: "Cuenta de tarjeta de crédito",
  },
  {
    id: AccountTypeId.EFECTIVO,
    type_name: "Efectivo",
    description: "Cuenta de Efectivo",
  },
] as const

// Valid account type IDs for validation
export const VALID_ACCOUNT_TYPE_IDS = Object.values(AccountTypeId)

// Helper function to check if an ID is a valid account type
export function isValidAccountTypeId(id: string): id is AccountTypeId {
  return VALID_ACCOUNT_TYPE_IDS.includes(id as AccountTypeId)
}

// Helper function to get account type by ID
export function getAccountTypeById(id: string) {
  return ACCOUNT_TYPES.find((type) => type.id === id)
}
