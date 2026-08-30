import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Expense, ExpenseSchema, Document, DocumentSchema } from '../types/schema';

export class ExpenseService {
  /**
   * Add shared expense
   */
  static async addExpense(
    householdId: string,
    userId: string,
    expense: Omit<Expense, 'id' | 'paidBy' | 'createdAt'>
  ): Promise<Expense> {
    try {
      const expenseRef = doc(collection(db, `households/${householdId}/expenses`));
      const newExpense: Expense = {
        ...expense,
        id: expenseRef.id,
        paidBy: userId,
        createdAt: new Date().toISOString(),
      };

      await setDoc(expenseRef, newExpense);
      return newExpense;
    } catch (error) {
      console.error('Failed to add expense:', error);
      throw error;
    }
  }

  /**
   * Get all expenses for a household
   */
  static async getHouseholdExpenses(householdId: string): Promise<Expense[]> {
    try {
      const snapshot = await getDocs(collection(db, `households/${householdId}/expenses`));
      return snapshot.docs.map((doc) => ExpenseSchema.parse(doc.data()));
    } catch (error) {
      console.error('Failed to get household expenses:', error);
      return [];
    }
  }

  /**
   * Get expenses for a specific user
   */
  static async getUserExpenses(householdId: string, userId: string): Promise<Expense[]> {
    try {
      const snapshot = await getDocs(collection(db, `households/${householdId}/expenses`));
      return snapshot.docs
        .filter((doc) => doc.data().paidBy === userId)
        .map((doc) => ExpenseSchema.parse(doc.data()));
    } catch (error) {
      console.error('Failed to get user expenses:', error);
      return [];
    }
  }

  /**
   * Update expense
   */
  static async updateExpense(
    householdId: string,
    expenseId: string,
    updates: Partial<Expense>
  ): Promise<void> {
    try {
      await updateDoc(doc(db, `households/${householdId}/expenses`, expenseId), updates);
    } catch (error) {
      console.error('Failed to update expense:', error);
      throw error;
    }
  }

  /**
   * Delete expense
   */
  static async deleteExpense(householdId: string, expenseId: string): Promise<void> {
    try {
      const expense = await getDoc(
        doc(db, `households/${householdId}/expenses`, expenseId)
      );
      if (expense.exists() && expense.data().attachmentUrl) {
        const storageRef = ref(storage, expense.data().attachmentUrl);
        await deleteObject(storageRef);
      }
      await deleteDoc(doc(db, `households/${householdId}/expenses`, expenseId));
    } catch (error) {
      console.error('Failed to delete expense:', error);
      throw error;
    }
  }

  /**
   * Calculate balance for a user (amount owed or owed to)
   */
  static async calculateUserBalance(
    householdId: string,
    userId: string
  ): Promise<{ paidAmount: number; owed: number; balance: number }> {
    try {
      const expenses = await this.getHouseholdExpenses(householdId);
      const members = await getDocs(collection(db, `households/${householdId}/users`));
      const memberCount = members.size;

      let paidAmount = 0;
      let share = 0;

      for (const expense of expenses) {
        if (expense.paidBy === userId) {
          paidAmount += expense.amount;
        }
        share += expense.amount / memberCount;
      }

      return {
        paidAmount,
        owed: share,
        balance: paidAmount - share,
      };
    } catch (error) {
      console.error('Failed to calculate user balance:', error);
      return { paidAmount: 0, owed: 0, balance: 0 };
    }
  }
}

export class DocumentService {
  /**
   * Upload and store document
   */
  static async uploadDocument(
    householdId: string,
    userId: string,
    file: Blob,
    fileName: string,
    documentType: string,
    appliance?: string
  ): Promise<Document> {
    try {
      // Upload to Firebase Storage
      const storageRef = ref(
        storage,
        `households/${householdId}/documents/${Date.now()}-${fileName}`
      );
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      // Create document record
      const docRef = doc(collection(db, `households/${householdId}/documents`));
      const document: Document = {
        id: docRef.id,
        name: fileName,
        documentType: documentType as any,
        appliance,
        url,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
      };

      await setDoc(docRef, document);
      return document;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    }
  }

  /**
   * Get all documents for a household
   */
  static async getHouseholdDocuments(householdId: string): Promise<Document[]> {
    try {
      const snapshot = await getDocs(collection(db, `households/${householdId}/documents`));
      return snapshot.docs.map((doc) => DocumentSchema.parse(doc.data()));
    } catch (error) {
      console.error('Failed to get documents:', error);
      return [];
    }
  }

  /**
   * Get documents by type
   */
  static async getDocumentsByType(
    householdId: string,
    documentType: string
  ): Promise<Document[]> {
    try {
      const snapshot = await getDocs(collection(db, `households/${householdId}/documents`));
      return snapshot.docs
        .filter((doc) => doc.data().documentType === documentType)
        .map((doc) => DocumentSchema.parse(doc.data()));
    } catch (error) {
      console.error('Failed to get documents by type:', error);
      return [];
    }
  }

  /**
   * Delete document
   */
  static async deleteDocument(householdId: string, documentId: string): Promise<void> {
    try {
      const docSnap = await getDoc(
        doc(db, `households/${householdId}/documents`, documentId)
      );
      if (docSnap.exists()) {
        const storageRef = ref(storage, docSnap.data().url);
        await deleteObject(storageRef);
      }
      await deleteDoc(doc(db, `households/${householdId}/documents`, documentId));
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  }
}
