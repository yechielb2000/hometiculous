export const ROLES = {
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
} as const;

export const PRESENCE_STATUS = {
  AT_HOME: 'AT_HOME',
  AWAY: 'AWAY',
  SHOPPING: 'SHOPPING',
} as const;

export const CHORE_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
} as const;

export const SHOPPING_STATUS = {
  NEEDED: 'NEEDED',
  BOUGHT: 'BOUGHT',
  DROPPED: 'DROPPED',
} as const;

export const INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  EXPIRED: 'EXPIRED',
} as const;

export const FREQUENCY_UNITS = {
  DAYS: 'DAYS',
  WEEKS: 'WEEKS',
  MONTHS: 'MONTHS',
} as const;

export const ROTATION_TYPES = {
  ROUND_ROBIN: 'ROUND_ROBIN',
  FIXED: 'FIXED',
} as const;

export const DOCUMENT_TYPES = {
  WARRANTY: 'WARRANTY',
  MANUAL: 'MANUAL',
  RECEIPT: 'RECEIPT',
  OTHER: 'OTHER',
} as const;

export const ROUTES = {
  AUTH: {
    LOGIN: 'login',
    SIGNUP: 'signup',
    FORGOT_PASSWORD: 'forgot-password',
  },
  HOME: 'home',
  HOUSEHOLD: {
    CREATE: 'create-household',
    JOIN: 'join-household',
    SETTINGS: 'household-settings',
  },
  CHORES: {
    LIST: 'chores',
    DETAILS: 'chore-details',
    CREATE_TEMPLATE: 'create-chore-template',
  },
  SHOPPING: {
    LIST: 'shopping',
    ADD_ITEM: 'add-shopping-item',
  },
  EXPENSES: {
    LIST: 'expenses',
    ADD_EXPENSE: 'add-expense',
    BALANCE: 'expense-balance',
  },
  DOCUMENTS: {
    LIST: 'documents',
    UPLOAD: 'upload-document',
  },
} as const;

export const QUERY_KEYS = {
  HOUSEHOLD: 'household',
  HOUSEHOLD_MEMBERS: 'householdMembers',
  CHORES: 'chores',
  USER_CHORES: 'userChores',
  SHOPPING_ITEMS: 'shoppingItems',
  EXPENSES: 'expenses',
  DOCUMENTS: 'documents',
  USER: 'user',
} as const;
