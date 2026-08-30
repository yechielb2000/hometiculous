import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ShoppingItem, ShoppingItemSchema } from '../types/schema';

export class ShoppingService {
  /**
   * Add item to shopping list
   */
  static async addShoppingItem(
    householdId: string,
    userId: string,
    item: Omit<ShoppingItem, 'id' | 'addedBy' | 'addedAt'>
  ): Promise<ShoppingItem> {
    try {
      const itemRef = doc(collection(db, `households/${householdId}/shopping_items`));
      const newItem: ShoppingItem = {
        ...item,
        id: itemRef.id,
        addedBy: userId,
        addedAt: new Date().toISOString(),
        status: 'NEEDED',
      };

      await setDoc(itemRef, newItem);
      return newItem;
    } catch (error) {
      console.error('Failed to add shopping item:', error);
      throw error;
    }
  }

  /**
   * Get all shopping items for a household
   */
  static async getHouseholdShoppingItems(householdId: string): Promise<ShoppingItem[]> {
    try {
      const snapshot = await getDocs(
        collection(db, `households/${householdId}/shopping_items`)
      );
      return snapshot.docs.map((doc) => ShoppingItemSchema.parse(doc.data()));
    } catch (error) {
      console.error('Failed to get shopping items:', error);
      return [];
    }
  }

  /**
   * Get shopping items by status
   */
  static async getShoppingItemsByStatus(
    householdId: string,
    status: string
  ): Promise<ShoppingItem[]> {
    try {
      const q = query(
        collection(db, `households/${householdId}/shopping_items`),
        where('status', '==', status)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ShoppingItemSchema.parse(doc.data()));
    } catch (error) {
      console.error('Failed to get shopping items by status:', error);
      return [];
    }
  }

  /**
   * Update shopping item status
   */
  static async updateItemStatus(
    householdId: string,
    itemId: string,
    status: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, `households/${householdId}/shopping_items`, itemId), {
        status,
      });
    } catch (error) {
      console.error('Failed to update item status:', error);
      throw error;
    }
  }

  /**
   * Delete shopping item
   */
  static async deleteShoppingItem(householdId: string, itemId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, `households/${householdId}/shopping_items`, itemId));
    } catch (error) {
      console.error('Failed to delete shopping item:', error);
      throw error;
    }
  }

  /**
   * Mark item as bought
   */
  static async markAsBought(householdId: string, itemId: string): Promise<void> {
    try {
      await this.updateItemStatus(householdId, itemId, 'BOUGHT');
    } catch (error) {
      console.error('Failed to mark item as bought:', error);
      throw error;
    }
  }

  /**
   * Mark item as dropped
   */
  static async markAsDropped(householdId: string, itemId: string): Promise<void> {
    try {
      await this.updateItemStatus(householdId, itemId, 'DROPPED');
    } catch (error) {
      console.error('Failed to mark item as dropped:', error);
      throw error;
    }
  }

  /**
   * Restore item to needed (from dropped or bought)
   */
  static async restoreToNeeded(householdId: string, itemId: string): Promise<void> {
    try {
      await this.updateItemStatus(householdId, itemId, 'NEEDED');
    } catch (error) {
      console.error('Failed to restore item:', error);
      throw error;
    }
  }

  /**
   * Auto-restock recurring items
   */
  static async autoRestockRecurringItems(householdId: string): Promise<void> {
    try {
      const items = await this.getHouseholdShoppingItems(householdId);
      const now = new Date();

      for (const item of items) {
        if (
          item.restockInterval &&
          (item.status === 'BOUGHT' || item.status === 'DROPPED')
        ) {
          const itemDate = new Date(item.addedAt);
          const daysSinceAdded = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);

          if (daysSinceAdded >= item.restockInterval) {
            await this.updateItemStatus(householdId, item.id, 'NEEDED');
          }
        }
      }
    } catch (error) {
      console.error('Failed to auto-restock items:', error);
      throw error;
    }
  }

  /**
   * Clear completed items
   */
  static async clearBoughtItems(householdId: string): Promise<void> {
    try {
      const boughtItems = await this.getShoppingItemsByStatus(householdId, 'BOUGHT');
      for (const item of boughtItems) {
        await this.deleteShoppingItem(householdId, item.id);
      }
    } catch (error) {
      console.error('Failed to clear bought items:', error);
      throw error;
    }
  }
}
