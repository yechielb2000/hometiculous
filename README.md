# Hometiculous - Home Manager Mobile App

A comprehensive household management platform built with Expo, React Native Paper, Firebase, and TanStack Query. Manage chores, shopping lists, expenses, and appliance warranties for your household with role-based access control.

## 🏗️ Project Architecture

### Tech Stack
- **Framework**: Expo with React Native
- **UI Components**: React Native Paper (Material Design 3)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query v5
- **Forms & Validation**: React Hook Form + Zod
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Language**: TypeScript

### Core Modules
1. **Authentication**: Google SSO and email/password authentication
2. **Household Management**: Create households, invite partners, manage roles
3. **Chore Scheduling**: Dynamic periodic task templates with auto-rotation
4. **Shopping Lists**: Real-time shared inventory with auto-restocking
5. **Expense Tracking**: Shared ledger and split-cost management
6. **Document Vault**: Store warranties, manuals, and receipts

## 📁 Project Structure

```
src/
├── assets/                    # Images, icons, theme definitions
├── config/                    # Firebase SDK configuration
├── constants/                 # Enums and application constants
├── context/                   # React context providers (if needed)
├── features/                  # Domain-driven feature modules
│   ├── auth/                 # Authentication screens & flows
│   ├── chores/               # Chore templates and scheduling
│   ├── expenses/             # Expense tracking and reporting
│   ├── household/            # Household settings & invitations
│   └── shopping/             # Shopping list management
├── hooks/                     # Custom React hooks
│   ├── useStore.ts           # Zustand store hooks
│   └── useQuery.ts           # TanStack Query + service hooks
├── services/                  # Business logic & API layer
│   ├── authService.ts        # Authentication operations
│   ├── choreService.ts       # Chore management
│   ├── expenseService.ts     # Expense & document operations
│   ├── householdService.ts   # Household & member management
│   └── shoppingService.ts    # Shopping list operations
├── types/                     # TypeScript interfaces & Zod schemas
│   └── schema.ts             # Master data models
└── utils/                     # Utility functions
    ├── dateUtils.ts          # Date formatting & calculations
    └── rotationUtils.ts      # Round-robin assignment logic
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Firebase project setup
- Expo CLI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yechielb2000/hometiculous
   cd hometiculous
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Firebase**
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password and Google Sign-In)
   - Create a Firestore database
   - Setup Firebase Storage for document uploads
   - Copy your config values

4. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase credentials
   ```

5. **Deploy Firestore Security Rules** (Optional but recommended)
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules
   ```

### Running the App

**Development mode:**
```bash
npm run start
```

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

**Web:**
```bash
npm run web
```

## 🔐 Role-Based Access Control (RBAC)

### ADMIN Permissions
- Create and update household settings
- Manage periodic task templates and schedules
- Invite new household members via email
- Remove members and change member roles
- Full access to all household features

### MEMBER Permissions
- Complete assigned chores (triggers auto-rotation)
- Add and manage shopping list items
- Log and track shared expenses
- Upload appliances and documents
- **Restricted**: Cannot edit periodic schedules, invite users, or modify household settings

### Security
- Permissions enforced at both UI and Firestore database layers
- All restricted actions validated by Cloud Firestore Security Rules
- User roles checked server-side for every mutation

## 🏠 Core Features

### 1. Household Management
- **Create Household**: First user becomes admin, gets 6-character invite code
- **Join via Code**: Partners enter invite code to join
- **Email Invitations**: Admins can invite partners via email with secure links
- **Member Management**: Add, remove, and manage member roles

### 2. Chore Scheduling
- **Periodic Templates**: Define recurring chores with intervals (days/weeks/months)
- **Auto-Rotation**: Automatically assign to next person in round-robin
- **Status Tracking**: PENDING → COMPLETED with automatic next chore generation
- **Due Date Management**: Calculated based on template frequency

### 3. Shopping Lists
- **Real-time Inventory**: Add, update, and manage shared shopping lists
- **Status Workflow**: NEEDED → BOUGHT → DROPPED
- **Auto-Restocking**: Items return to NEEDED after customized intervals
- **Clear Completed**: Bulk remove bought or dropped items

### 4. Expense Tracking
- **Shared Ledger**: Log all household purchases
- **Split Calculations**: Automatically calculate per-person share
- **Balance Tracking**: See who owes whom
- **Receipt Attachments**: Store photos and documents with expenses

### 5. Document Vault
- **Document Storage**: Upload warranties, manuals, receipts
- **Categorization**: Organize by type and appliance
- **Secure Access**: All documents stored in Firebase Storage
- **Easy Retrieval**: Search and filter by document type

## 📱 Data Models

All data models are defined in `src/types/schema.ts` using Zod for runtime validation.

### Key Entities
- **Household**: Container for all household data
- **User**: Member profile within a household
- **PeriodicTemplate**: Defines recurring chore schedules
- **Chore**: Individual task assignment
- **ShoppingItem**: Grocery/supply list item
- **Expense**: Shared expense entry
- **Document**: Stored files (warranties, manuals, etc.)
- **Invitation**: Pending partner invitations

## 🔄 Data Flow

```
UI Components
    ↓
Custom Hooks (useQuery, useMutation)
    ↓
Services Layer (Clean business logic)
    ↓
Firebase SDK (Firestore, Auth, Storage)
    ↓
Firestore + Authentication + Cloud Storage
```

## 🛡️ Security Features

1. **Firebase Authentication**: Secure user authentication with multiple providers
2. **Firestore Security Rules**: Database-level access control
3. **Type Safety**: Full TypeScript + Zod schema validation
4. **Environment Variables**: Sensitive config protected via .env
5. **Cloud Storage Security**: Authenticated file uploads and downloads

## 🔗 API Integration Points

### Authentication Service
- `loginWithEmail(email, password)`
- `signupWithEmail(email, password, displayName)`
- `logout()`
- `getUserProfile(uid)`
- `updatePresenceStatus(uid, status)`

### Household Service
- `createHousehold(userId, householdName)`
- `joinHousehold(householdId, userId)`
- `invitePartnerByEmail(householdId, adminUid, partnerEmail)`
- `getHouseholdMembers(householdId)`
- `promoteToAdmin(householdId, userId)`
- `demoteToMember(householdId, userId)`

### Chore Service
- `createPeriodicTemplate(householdId, template)`
- `getHouseholdChores(householdId)`
- `getUserChores(householdId, userId)`
- `completeChore(householdId, choreId)`

### Shopping Service
- `addShoppingItem(householdId, userId, item)`
- `getHouseholdShoppingItems(householdId)`
- `updateItemStatus(householdId, itemId, status)`
- `autoRestockRecurringItems(householdId)`

### Expense Service
- `addExpense(householdId, userId, expense)`
- `getHouseholdExpenses(householdId)`
- `calculateUserBalance(householdId, userId)`

### Document Service
- `uploadDocument(householdId, userId, file, ...)`
- `getHouseholdDocuments(householdId)`
- `deleteDocument(householdId, documentId)`

## 🧪 Testing

(Recommended test structure to be added)

## 📦 Deployment

### Firebase Deployment
1. Install Firebase CLI
2. Configure firebase.json with rules
3. Deploy: `firebase deploy`

### Mobile App Deployment
- **iOS**: Xcode build or EAS Build
- **Android**: Android Studio build or EAS Build
- **Managed Builds**: `eas build --platform all`

## 📝 License

[MIT](README.md)

## 🆘 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Built with ❤️ for household management**
