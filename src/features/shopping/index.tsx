import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

/**
 * Shopping feature module
 * Contains:
 * - Shopping list screen
 * - Add item screen
 * - Status management (NEEDED, BOUGHT, DROPPED)
 * - Auto-restocking for recurring items
 * - Clear completed items
 */

export const ShoppingFeatureModule: React.FC = () => (
  <View style={styles.container}>
    <Text>Shopping List Module</Text>
    <Text style={styles.subtitle}>
      Features: Add items, manage status, auto-restock, shared inventory
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
