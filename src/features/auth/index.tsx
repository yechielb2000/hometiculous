import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

/**
 * Authentication feature module
 * Contains:
 * - Login screen (email/password + Google SSO)
 * - Signup screen
 * - Forgot password flow
 * - Session persistence
 * - Logout functionality
 */

export const AuthFeatureModule: React.FC = () => (
  <View style={styles.container}>
    <Text>Authentication Module</Text>
    <Text style={styles.subtitle}>
      Features: Login, signup, Google SSO, password reset, session management
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 12,
  },
});
