import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

/**
 * Chores feature module
 * Contains:
 * - Chore list screen
 * - Chore details screen
 * - Create/edit periodic template (ADMIN)
 * - Mark chore as complete
 * - Rotation logic display
 */

export const ChoresFeatureModule: React.FC = () => (
  <View style={styles.container}>
    <Text>Chores Management Module</Text>
    <Text style={styles.subtitle}>
      Features: View chores, create templates, auto-rotation, complete tasks
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
