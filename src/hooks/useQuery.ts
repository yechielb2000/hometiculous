import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore, useHouseholdStore } from './useStore';
import { HouseholdService } from '../services/householdService';
import { ChoreService } from '../services/choreService';
import { ShoppingService } from '../services/shoppingService';
import { ExpenseService, DocumentService } from '../services/expenseService';
import { useCallback, useEffect } from 'react';

/**
 * Hook to check if current user is admin
 */
export const useAdminGuard = () => {
  const { isAdmin } = useHouseholdStore();
  return { isAdmin };
};

/**
 * Hook to fetch current household
 */
export const useHousehold = (householdId: string | null) => {
  return useQuery({
    queryKey: ['household', householdId],
    queryFn: async () => {
      if (!householdId) return null;
      return await HouseholdService.getHousehold(householdId);
    },
    enabled: !!householdId,
  });
};

/**
 * Hook to fetch household members
 */
export const useHouseholdMembers = (householdId: string | null) => {
  return useQuery({
    queryKey: ['householdMembers', householdId],
    queryFn: async () => {
      if (!householdId) return [];
      return await HouseholdService.getHouseholdMembers(householdId);
    },
    enabled: !!householdId,
  });
};

/**
 * Hook to fetch household chores
 */
export const useHouseholdChores = (householdId: string | null) => {
  return useQuery({
    queryKey: ['chores', householdId],
    queryFn: async () => {
      if (!householdId) return [];
      return await ChoreService.getHouseholdChores(householdId);
    },
    enabled: !!householdId,
  });
};

/**
 * Hook to fetch user chores
 */
export const useUserChores = (householdId: string | null, userId: string | null) => {
  return useQuery({
    queryKey: ['userChores', householdId, userId],
    queryFn: async () => {
      if (!householdId || !userId) return [];
      return await ChoreService.getUserChores(householdId, userId);
    },
    enabled: !!householdId && !!userId,
  });
};

/**
 * Hook to fetch shopping items
 */
export const useShoppingItems = (householdId: string | null) => {
  return useQuery({
    queryKey: ['shoppingItems', householdId],
    queryFn: async () => {
      if (!householdId) return [];
      return await ShoppingService.getHouseholdShoppingItems(householdId);
    },
    enabled: !!householdId,
  });
};

/**
 * Hook to fetch household expenses
 */
export const useHouseholdExpenses = (householdId: string | null) => {
  return useQuery({
    queryKey: ['expenses', householdId],
    queryFn: async () => {
      if (!householdId) return [];
      return await ExpenseService.getHouseholdExpenses(householdId);
    },
    enabled: !!householdId,
  });
};

/**
 * Hook to fetch household documents
 */
export const useHouseholdDocuments = (householdId: string | null) => {
  return useQuery({
    queryKey: ['documents', householdId],
    queryFn: async () => {
      if (!householdId) return [];
      return await DocumentService.getHouseholdDocuments(householdId);
    },
    enabled: !!householdId,
  });
};

/**
 * Hook to complete a chore
 */
export const useCompleteChore = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (choreId: string) => {
      if (!householdId) throw new Error('No household selected');
      await ChoreService.completeChore(householdId, choreId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chores', householdId] });
      queryClient.invalidateQueries({ queryKey: ['userChores', householdId] });
    },
  });
};

/**
 * Hook to update shopping item status
 */
export const useUpdateShoppingItemStatus = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string; status: string }) => {
      if (!householdId) throw new Error('No household selected');
      await ShoppingService.updateItemStatus(householdId, itemId, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shoppingItems', householdId] });
    },
  });
};

/**
 * Hook to add expense
 */
export const useAddExpense = (householdId: string | null) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: async (expense: any) => {
      if (!householdId || !user) throw new Error('Invalid context');
      return await ExpenseService.addExpense(householdId, user.uid, expense);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', householdId] });
    },
  });
};

/**
 * Hook to check if current user is admin in household
 */
export const useIsAdminInHousehold = (householdId: string | null) => {
  const user = useAuthStore((state) => state.user);
  const { data: household } = useHousehold(householdId);

  return household?.admins?.includes(user?.uid || '') || false;
};
