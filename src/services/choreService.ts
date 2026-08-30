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
import {
  PeriodicTemplate,
  PeriodicTemplateSchema,
  Chore,
  ChoreSchema,
} from '../types/schema';

// Utility to calculate next date based on frequency
const calculateNextDueDate = (
  currentDate: Date,
  frequencyValue: number,
  frequencyUnit: string
): Date => {
  const nextDate = new Date(currentDate);
  switch (frequencyUnit) {
    case 'DAYS':
      nextDate.setDate(nextDate.getDate() + frequencyValue);
      break;
    case 'WEEKS':
      nextDate.setDate(nextDate.getDate() + frequencyValue * 7);
      break;
    case 'MONTHS':
      nextDate.setMonth(nextDate.getMonth() + frequencyValue);
      break;
  }
  return nextDate;
};

// Utility for round-robin assignment
const getNextAssignee = (
  assignedTo: string[],
  lastAssignee: string | undefined
): string => {
  if (!lastAssignee || !assignedTo.includes(lastAssignee)) {
    return assignedTo[0];
  }
  const currentIndex = assignedTo.indexOf(lastAssignee);
  return assignedTo[(currentIndex + 1) % assignedTo.length];
};

export class ChoreService {
  /**
   * Create a periodic chore template (ADMIN only)
   */
  static async createPeriodicTemplate(
    householdId: string,
    template: Omit<PeriodicTemplate, 'id' | 'createdAt'>
  ): Promise<PeriodicTemplate> {
    try {
      const templateRef = doc(collection(db, `households/${householdId}/periodic_templates`));
      const newTemplate: PeriodicTemplate = {
        ...template,
        id: templateRef.id,
        createdAt: new Date().toISOString(),
      };

      await setDoc(templateRef, newTemplate);

      // Create initial chore
      await this.createChoreFromTemplate(householdId, newTemplate);

      return newTemplate;
    } catch (error) {
      console.error('Failed to create periodic template:', error);
      throw error;
    }
  }

  /**
   * Get periodic template by ID
   */
  static async getPeriodicTemplate(
    householdId: string,
    templateId: string
  ): Promise<PeriodicTemplate | null> {
    try {
      const docSnap = await getDoc(
        doc(db, `households/${householdId}/periodic_templates`, templateId)
      );
      if (docSnap.exists()) {
        return PeriodicTemplateSchema.parse(docSnap.data());
      }
      return null;
    } catch (error) {
      console.error('Failed to get periodic template:', error);
      return null;
    }
  }

  /**
   * Get all periodic templates for a household
   */
  static async getHouseholdTemplates(householdId: string): Promise<PeriodicTemplate[]> {
    try {
      const snapshot = await getDocs(
        collection(db, `households/${householdId}/periodic_templates`)
      );
      return snapshot.docs.map((doc) => PeriodicTemplateSchema.parse(doc.data()));
    } catch (error) {
      console.error('Failed to get household templates:', error);
      return [];
    }
  }

  /**
   * Update periodic template (ADMIN only)
   */
  static async updatePeriodicTemplate(
    householdId: string,
    templateId: string,
    updates: Partial<PeriodicTemplate>
  ): Promise<void> {
    try {
      await updateDoc(
        doc(db, `households/${householdId}/periodic_templates`, templateId),
        updates
      );
    } catch (error) {
      console.error('Failed to update periodic template:', error);
      throw error;
    }
  }

  /**
   * Delete periodic template (ADMIN only)
   */
  static async deletePeriodicTemplate(householdId: string, templateId: string): Promise<void> {
    try {
      await deleteDoc(
        doc(db, `households/${householdId}/periodic_templates`, templateId)
      );
    } catch (error) {
      console.error('Failed to delete periodic template:', error);
      throw error;
    }
  }

  /**
   * Create a chore from template
   */
  static async createChoreFromTemplate(
    householdId: string,
    template: PeriodicTemplate
  ): Promise<Chore> {
    try {
      const assignedUser = getNextAssignee(template.assignedTo, undefined);
      const dueDate = new Date();

      const choreRef = doc(collection(db, `households/${householdId}/chores`));
      const chore: Chore = {
        id: choreRef.id,
        templateId: template.id,
        title: template.title,
        dueDate: dueDate.toISOString(),
        assignedUser,
        status: 'PENDING',
      };

      await setDoc(choreRef, chore);
      return chore;
    } catch (error) {
      console.error('Failed to create chore from template:', error);
      throw error;
    }
  }

  /**
   * Get all pending chores for a household
   */
  static async getHouseholdChores(householdId: string): Promise<Chore[]> {
    try {
      const snapshot = await getDocs(collection(db, `households/${householdId}/chores`));
      return snapshot.docs.map((doc) => ChoreSchema.parse(doc.data()));
    } catch (error) {
      console.error('Failed to get household chores:', error);
      return [];
    }
  }

  /**
   * Get chores assigned to a specific user
   */
  static async getUserChores(householdId: string, userId: string): Promise<Chore[]> {
    try {
      const q = query(
        collection(db, `households/${householdId}/chores`),
        where('assignedUser', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ChoreSchema.parse(doc.data()));
    } catch (error) {
      console.error('Failed to get user chores:', error);
      return [];
    }
  }

  /**
   * Complete a chore and create next one
   */
  static async completeChore(householdId: string, choreId: string): Promise<void> {
    try {
      const choreRef = doc(db, `households/${householdId}/chores`, choreId);
      const choreSnap = await getDoc(choreRef);

      if (!choreSnap.exists()) {
        throw new Error('Chore not found');
      }

      const chore = ChoreSchema.parse(choreSnap.data());

      // Mark chore as completed
      await updateDoc(choreRef, {
        status: 'COMPLETED',
        completedAt: serverTimestamp(),
      });

      // Get template to create next chore
      const template = await this.getPeriodicTemplate(householdId, chore.templateId);
      if (template) {
        const nextAssignee = getNextAssignee(template.assignedTo, chore.assignedUser);
        const currentDueDate = new Date(chore.dueDate);
        const nextDueDate = calculateNextDueDate(
          currentDueDate,
          template.frequencyValue,
          template.frequencyUnit
        );

        const nextChoreRef = doc(collection(db, `households/${householdId}/chores`));
        const nextChore: Chore = {
          id: nextChoreRef.id,
          templateId: template.id,
          title: template.title,
          dueDate: nextDueDate.toISOString(),
          assignedUser: nextAssignee,
          status: 'PENDING',
        };

        await setDoc(nextChoreRef, nextChore);
      }
    } catch (error) {
      console.error('Failed to complete chore:', error);
      throw error;
    }
  }

  /**
   * Get chore by ID
   */
  static async getChore(householdId: string, choreId: string): Promise<Chore | null> {
    try {
      const docSnap = await getDoc(doc(db, `households/${householdId}/chores`, choreId));
      if (docSnap.exists()) {
        return ChoreSchema.parse(docSnap.data());
      }
      return null;
    } catch (error) {
      console.error('Failed to get chore:', error);
      return null;
    }
  }
}
