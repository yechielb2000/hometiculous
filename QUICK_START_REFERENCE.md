# Quick Start Reference Guide

Quick reference for common tasks in Hometiculous development.

## 🚀 Setup (First Time)

```bash
# Clone and install
git clone <repo-url>
cd hometiculous
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with Firebase credentials

# Run app
npm run start
```

## 📱 Running the App

```bash
# iOS (macOS only)
npm run ios

# Android
npm run android

# Web browser
npm run web
```

## 🏗️ Project Structure Quick Map

```
src/
├── config/firebase.ts           ← Firebase init
├── types/schema.ts              ← All data models (Zod)
├── constants/enums.ts           ← Roles, statuses, routes
├── services/                    ← Business logic
│   ├── authService.ts
│   ├── householdService.ts
│   ├── choreService.ts
│   ├── shoppingService.ts
│   └── expenseService.ts
├── hooks/                       ← React hooks
│   ├── useStore.ts             ← Zustand stores
│   └── useQuery.ts             ← TanStack Query + service calls
├── features/                    ← UI screens (to be implemented)
└── utils/                       ← Helpers (date, rotation)
```

## 🔑 Key Files by Domain

| Task | File |
|------|------|
| Add new data type | `src/types/schema.ts` |
| Authentication logic | `src/services/authService.ts` |
| Household CRUD | `src/services/householdService.ts` |
| Chore operations | `src/services/choreService.ts` |
| Shopping list | `src/services/shoppingService.ts` |
| Expenses & docs | `src/services/expenseService.ts` |
| Global state | `src/hooks/useStore.ts` |
| Data fetching hooks | `src/hooks/useQuery.ts` |
| Firestore rules | `firestore.rules` |
| Environment config | `.env.example` |

## 🎯 Common Tasks

### Add a New Feature Component

1. **Create folder** in `src/features/my-feature/`
2. **Use hooks** to get data:
   ```typescript
   const { data: items, isLoading } = useMyItems(householdId);
   ```
3. **Use mutations** to update:
   ```typescript
   const { mutate: addItem } = useAddItem(householdId);
   addItem(newItemData);
   ```
4. **Use Paper** components for UI:
   ```typescript
   <Button onPress={handlePress}>Click me</Button>
   ```

### Create a New Service Method

1. **Edit** `src/services/myService.ts`
2. **Add method** with type-safe parameters and returns
3. **Use** in hooks or components via custom hook

### Add a Form Screen

1. **Import hooks**:
   ```typescript
   import { useForm, Controller } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   ```
2. **Create form schema**:
   ```typescript
   const { control, handleSubmit } = useForm({
     resolver: zodResolver(MyFormSchema),
   });
   ```
3. **Render fields** with Controller
4. **Submit** with mutation hook

### Update Firestore Rules

1. **Edit** `firestore.rules`
2. **Deploy** with: `firebase deploy --only firestore:rules`

## 🔐 RBAC Checklist

When building admin-only features:
- [ ] Add permission check in component: `useIsAdminInHousehold()`
- [ ] Hide UI if not admin
- [ ] Service method validates before operation
- [ ] Firestore Rules enforce at database level

## 📝 Data Model Pattern

Every entity follows this pattern:

```typescript
// In src/types/schema.ts
export const MyEntitySchema = z.object({
  id: z.string(),
  name: z.string(),
  // ... other fields
  createdAt: z.string(),
});
export type MyEntity = z.infer<typeof MyEntitySchema>;

// Form validation
export const MyEntityFormSchema = z.object({
  name: z.string().min(1),
  // ... fields user inputs
});
export type MyEntityForm = z.infer<typeof MyEntityFormSchema>;
```

## 🪝 Custom Hook Pattern

```typescript
// In src/hooks/useQuery.ts
export const useMyEntities = (householdId: string | null) => {
  return useQuery({
    queryKey: ['myEntities', householdId],
    queryFn: async () => {
      if (!householdId) return [];
      return await MyService.getEntities(householdId);
    },
    enabled: !!householdId,
  });
};

// In component
const { data: entities, isLoading } = useMyEntities(householdId);
```

## 🔄 Mutation Pattern

```typescript
export const useAddEntity = (householdId: string | null) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (entity: MyEntity) => {
      if (!householdId) throw new Error('No household');
      return await MyService.add(householdId, entity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myEntities'] });
    },
  });
};
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm run test

# Run tests with coverage
npm run test:coverage
```

## 📦 Build & Deploy

```bash
# Web build
npm run build:web

# Mobile builds (EAS)
eas build --platform all

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

## 🐛 Debugging

### Enable Firebase Logging
```typescript
import { getAuth } from 'firebase/auth';
const auth = getAuth();
// Check auth.currentUser in console
```

### TanStack Query DevTools
```bash
npm install @tanstack/react-query-devtools
```

### Firestore Emulator
```bash
firebase emulators:start
# Set EMULATOR_HOST in development
```

## 📚 Documentation

- **README.md** - Project overview
- **IMPLEMENTATION_GUIDE.md** - Detailed usage examples
- **ARCHITECTURE_DECISIONS.md** - Why things are designed this way
- **QUICK_START_REFERENCE.md** - This file

## ⚡ Performance Tips

1. **Memoize callbacks**:
   ```typescript
   const handleClick = useCallback(() => {
     mutate(data);
   }, [mutate, data]);
   ```

2. **Use query limits**:
   ```typescript
   query(collection(...), limit(20))
   ```

3. **Pagination with startAfter**:
   ```typescript
   query(collection(...), 
     orderBy('createdAt'), 
     startAfter(lastDoc), 
     limit(20)
   )
   ```

## 🚨 Common Mistakes to Avoid

❌ **Don't**: Write to Firestore directly in components
✅ **Do**: Use service methods + hooks

❌ **Don't**: Trust client-side role checks
✅ **Do**: Always validate on backend/database

❌ **Don't**: Create CSS files
✅ **Do**: Use Paper components and style props

❌ **Don't**: Forget error handling
✅ **Do**: Always handle loading and error states

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Module not found" | Run `npm install` |
| Firebase auth error | Check `.env.local` credentials |
| Permission denied | Verify Firestore rules and user role |
| UI styling broken | Use Paper components, check props |
| Slow queries | Add limits and pagination |

## 🔗 Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [Expo Docs](https://docs.expo.dev/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Last Updated**: 2026-08-30
