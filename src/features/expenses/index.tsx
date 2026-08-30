import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

/**
 * Expenses feature module
 * Contains:
 * - Expense list screen
 * - Add expense screen
 * - Expense details screen
 * - Split cost calculation
 * - Balance tracking
 * - Receipt/attachment management
 */

export const ExpensesFeatureModule: React.FC = () => (
  <View style={styles.container}>
    <Text>Expenses Module</Text>
    <Text style={styles.subtitle}>
      Features: Track expenses, calculate splits, manage receipts, view balances
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
