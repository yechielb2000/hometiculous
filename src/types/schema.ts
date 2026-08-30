import { z } from 'zod';

// Enums
export const RoleEnum = z.enum(['ADMIN', 'MEMBER']);
export type Role = z.infer<typeof RoleEnum>;

export const PresenceStatusEnum = z.enum(['AT_HOME', 'AWAY', 'SHOPPING']);
export type PresenceStatus = z.infer<typeof PresenceStatusEnum>;

export const ChoreStatusEnum = z.enum(['PENDING', 'COMPLETED']);
export type ChoreStatus = z.infer<typeof ChoreStatusEnum>;

export const ShoppingStatusEnum = z.enum(['NEEDED', 'BOUGHT', 'DROPPED']);
export type ShoppingStatus = z.infer<typeof ShoppingStatusEnum>;

export const InvitationStatusEnum = z.enum(['PENDING', 'ACCEPTED', 'EXPIRED']);
export type InvitationStatus = z.infer<typeof InvitationStatusEnum>;

export const FrequencyUnitEnum = z.enum(['DAYS', 'WEEKS', 'MONTHS']);
export type FrequencyUnit = z.infer<typeof FrequencyUnitEnum>;

export const RotationTypeEnum = z.enum(['ROUND_ROBIN', 'FIXED']);
export type RotationType = z.infer<typeof RotationTypeEnum>;

// User & Authentication
export const UserProfileSchema = z.object({
  uid: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  photoURL: z.string().optional(),
  role: RoleEnum,
  presenceStatus: PresenceStatusEnum,
  updatedAt: z.string(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

// Household
export const HouseholdSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Household name required'),
  inviteCode: z.string().length(6),
  admins: z.array(z.string()),
  members: z.array(z.string()),
  createdAt: z.string(),
});
export type Household = z.infer<typeof HouseholdSchema>;

// Invitations
export const InvitationSchema = z.object({
  id: z.string(),
  invitedEmail: z.string().email(),
  invitedBy: z.string(),
  status: InvitationStatusEnum,
  createdAt: z.string(),
});
export type Invitation = z.infer<typeof InvitationSchema>;

// Periodic Templates
export const PeriodicTemplateSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title required'),
  frequencyValue: z.number().positive(),
  frequencyUnit: FrequencyUnitEnum,
  assignedTo: z.array(z.string()).min(1, 'At least one user required'),
  rotationType: RotationTypeEnum,
  createdBy: z.string(),
  createdAt: z.string().optional(),
});
export type PeriodicTemplate = z.infer<typeof PeriodicTemplateSchema>;

// Chores
export const ChoreSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  title: z.string(),
  dueDate: z.string(),
  assignedUser: z.string(),
  status: ChoreStatusEnum,
  completedAt: z.string().optional(),
});
export type Chore = z.infer<typeof ChoreSchema>;

// Shopping Items
export const ShoppingItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Item name required'),
  category: z.string().optional(),
  status: ShoppingStatusEnum,
  addedBy: z.string(),
  addedAt: z.string(),
  restockInterval: z.number().optional(), // Days
});
export type ShoppingItem = z.infer<typeof ShoppingItemSchema>;

// Expenses
export const ExpenseSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Description required'),
  amount: z.number().positive('Amount must be positive'),
  paidBy: z.string(),
  category: z.string().optional(),
  createdAt: z.string(),
  attachmentUrl: z.string().optional(),
});
export type Expense = z.infer<typeof ExpenseSchema>;

// Documents
export const DocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  documentType: z.enum(['WARRANTY', 'MANUAL', 'RECEIPT', 'OTHER']),
  appliance: z.string().optional(),
  url: z.string(),
  uploadedBy: z.string(),
  uploadedAt: z.string(),
});
export type Document = z.infer<typeof DocumentSchema>;

// Form Validation Schemas
export const CreateHouseholdFormSchema = z.object({
  name: z.string().min(1, 'Household name required').max(100),
});
export type CreateHouseholdForm = z.infer<typeof CreateHouseholdFormSchema>;

export const JoinHouseholdFormSchema = z.object({
  inviteCode: z.string().length(6, 'Invite code must be 6 characters'),
});
export type JoinHouseholdForm = z.infer<typeof JoinHouseholdFormSchema>;

export const InvitePartnerFormSchema = z.object({
  email: z.string().email('Invalid email address'),
});
export type InvitePartnerForm = z.infer<typeof InvitePartnerFormSchema>;

export const CreateChoreTemplateFormSchema = z.object({
  title: z.string().min(1, 'Title required'),
  frequencyValue: z.number().positive('Frequency must be positive'),
  frequencyUnit: FrequencyUnitEnum,
  assignedTo: z.array(z.string()).min(1, 'Select at least one user'),
  rotationType: RotationTypeEnum,
});
export type CreateChoreTemplateForm = z.infer<typeof CreateChoreTemplateFormSchema>;

export const AddShoppingItemFormSchema = z.object({
  name: z.string().min(1, 'Item name required'),
  category: z.string().optional(),
  restockInterval: z.number().optional(),
});
export type AddShoppingItemForm = z.infer<typeof AddShoppingItemFormSchema>;

export const AddExpenseFormSchema = z.object({
  description: z.string().min(1, 'Description required'),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().optional(),
});
export type AddExpenseForm = z.infer<typeof AddExpenseFormSchema>;
