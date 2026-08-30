import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  getIdTokenResult,
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { UserProfile, UserProfileSchema } from '../types/schema';

export class AuthService {
  /**
   * Sign in with email and password
   */
  static async loginWithEmail(email: string, password: string): Promise<UserProfile | null> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return await this.getUserProfile(result.user.uid);
    } catch (error) {
      console.error('Email login failed:', error);
      throw error;
    }
  }

  /**
   * Sign up with email and password
   */
  static async signupWithEmail(
    email: string,
    password: string,
    displayName: string
  ): Promise<UserProfile | null> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: result.user.uid,
        displayName,
        email,
        photoURL: result.user.photoURL || undefined,
        role: 'MEMBER',
        presenceStatus: 'AT_HOME',
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', result.user.uid), userProfile);
      return userProfile;
    } catch (error) {
      console.error('Email signup failed:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  static async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  /**
   * Get current user profile from Firestore
   */
  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return UserProfileSchema.parse(userDoc.data());
      }
      return null;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      return null;
    }
  }

  /**
   * Update user presence status
   */
  static async updatePresenceStatus(uid: string, status: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        presenceStatus: status,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Failed to update presence status:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return auth.currentUser !== null;
  }

  /**
   * Get user ID token
   */
  static async getIdToken(): Promise<string | null> {
    try {
      if (auth.currentUser) {
        return await auth.currentUser.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Failed to get ID token:', error);
      return null;
    }
  }
}
