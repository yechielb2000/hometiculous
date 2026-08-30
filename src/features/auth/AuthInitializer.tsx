import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { auth } from '../../config/firebase';
import { AuthService } from '../../services/authService';
import { useAuthStore } from '../../hooks/useStore';

interface AuthScreenProps {
  onAuthStateChanged?: (isAuthenticated: boolean) => void;
}

/**
 * Auth provider component that initializes auth state
 */
export const AuthInitializer: React.FC<AuthScreenProps & { children: React.ReactNode }> = ({
  children,
  onAuthStateChanged,
}) => {
  const { setUser, setLoading, setError } = useAuthStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        setLoading(true);
        if (firebaseUser) {
          const userProfile = await AuthService.getUserProfile(firebaseUser.uid);
          setUser(userProfile);
          onAuthStateChanged?.(true);
        } else {
          setUser(null);
          onAuthStateChanged?.(false);
        }
      } catch (error: any) {
        setError(error.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading, setError, onAuthStateChanged]);

  return <>{children}</>;
};

/**
 * Loading component
 */
export const AuthLoadingScreen: React.FC = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" />
    <Text style={styles.text}>Loading...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
  },
});
