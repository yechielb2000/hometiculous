import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Household,
  HouseholdSchema,
  UserProfile,
  Invitation,
  InvitationSchema,
} from '../types/schema';

// Utility to generate 6-character invite code
const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export class HouseholdService {
  /**
   * Create a new household
   */
  static async createHousehold(
    userId: string,
    householdName: string
  ): Promise<Household> {
    try {
      const inviteCode = generateInviteCode();
      const householdId = doc(collection(db, 'households')).id;

      const household: Household = {
        id: householdId,
        name: householdName,
        inviteCode,
        admins: [userId],
        members: [userId],
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'households', householdId), household);
      return household;
    } catch (error) {
      console.error('Failed to create household:', error);
      throw error;
    }
  }

  /**
   * Get household by ID
   */
  static async getHousehold(householdId: string): Promise<Household | null> {
    try {
      const docSnap = await getDoc(doc(db, 'households', householdId));
      if (docSnap.exists()) {
        return HouseholdSchema.parse(docSnap.data());
      }
      return null;
    } catch (error) {
      console.error('Failed to get household:', error);
      return null;
    }
  }

  /**
   * Find household by invite code
   */
  static async findHouseholdByInviteCode(inviteCode: string): Promise<Household | null> {
    try {
      const q = query(
        collection(db, 'households'),
        where('inviteCode', '==', inviteCode.toUpperCase())
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return HouseholdSchema.parse(querySnapshot.docs[0].data());
      }
      return null;
    } catch (error) {
      console.error('Failed to find household by invite code:', error);
      return null;
    }
  }

  /**
   * Join household
   */
  static async joinHousehold(householdId: string, userId: string): Promise<void> {
    try {
      const householdRef = doc(db, 'households', householdId);
      await updateDoc(householdRef, {
        members: arrayUnion(userId),
      });

      // Create user profile in household subcollection
      const userProfile: Partial<UserProfile> = {
        uid: userId,
        role: 'MEMBER',
        presenceStatus: 'AT_HOME',
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, `households/${householdId}/users`, userId), userProfile);
    } catch (error) {
      console.error('Failed to join household:', error);
      throw error;
    }
  }

  /**
   * Update household name (ADMIN only)
   */
  static async updateHouseholdName(householdId: string, newName: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'households', householdId), {
        name: newName,
      });
    } catch (error) {
      console.error('Failed to update household name:', error);
      throw error;
    }
  }

  /**
   * Invite partner by email (ADMIN only)
   */
  static async invitePartnerByEmail(
    householdId: string,
    adminUid: string,
    partnerEmail: string
  ): Promise<string> {
    try {
      const invitationRef = await addDoc(
        collection(db, `households/${householdId}/invitations`),
        {
          invitedEmail: partnerEmail.toLowerCase().trim(),
          invitedBy: adminUid,
          status: 'PENDING',
          createdAt: serverTimestamp(),
        }
      );
      return invitationRef.id;
    } catch (error) {
      console.error('Failed to invite partner:', error);
      throw error;
    }
  }

  /**
   * Get invitations for a household (ADMIN only)
   */
  static async getHouseholdInvitations(householdId: string): Promise<Invitation[]> {
    try {
      const snapshot = await getDocs(
        collection(db, `households/${householdId}/invitations`)
      );
      return snapshot.docs.map((doc) => InvitationSchema.parse(doc.data()));
    } catch (error) {
      console.error('Failed to get household invitations:', error);
      return [];
    }
  }

  /**
   * Accept invitation
   */
  static async acceptInvitation(
    householdId: string,
    invitationId: string,
    userId: string
  ): Promise<void> {
    try {
      // Update invitation status
      await updateDoc(doc(db, `households/${householdId}/invitations`, invitationId), {
        status: 'ACCEPTED',
      });

      // Add user to household
      await this.joinHousehold(householdId, userId);
    } catch (error) {
      console.error('Failed to accept invitation:', error);
      throw error;
    }
  }

  /**
   * Remove household member (ADMIN only)
   */
  static async removeMember(householdId: string, userId: string): Promise<void> {
    try {
      const householdRef = doc(db, 'households', householdId);
      await updateDoc(householdRef, {
        members: arrayRemove(userId),
        admins: arrayRemove(userId),
      });

      // Delete user profile from household
      await deleteDoc(doc(db, `households/${householdId}/users`, userId));
    } catch (error) {
      console.error('Failed to remove member:', error);
      throw error;
    }
  }

  /**
   * Promote member to admin (ADMIN only)
   */
  static async promoteToAdmin(householdId: string, userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'households', householdId), {
        admins: arrayUnion(userId),
      });
    } catch (error) {
      console.error('Failed to promote member:', error);
      throw error;
    }
  }

  /**
   * Demote admin to member (ADMIN only)
   */
  static async demoteToMember(householdId: string, userId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'households', householdId), {
        admins: arrayRemove(userId),
      });
    } catch (error) {
      console.error('Failed to demote admin:', error);
      throw error;
    }
  }

  /**
   * Get all users in household
   */
  static async getHouseholdMembers(householdId: string): Promise<UserProfile[]> {
    try {
      const snapshot = await getDocs(collection(db, `households/${householdId}/users`));
      return snapshot.docs.map((doc) => doc.data() as UserProfile);
    } catch (error) {
      console.error('Failed to get household members:', error);
      return [];
    }
  }
}
