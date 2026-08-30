/**
 * Get next assignee in round-robin rotation
 */
export const getNextAssigneeInRotation = (
  assignedTo: string[],
  lastAssignee: string | null | undefined
): string => {
  if (!assignedTo || assignedTo.length === 0) {
    throw new Error('No users available for assignment');
  }

  // If no last assignee, start with first person
  if (!lastAssignee || !assignedTo.includes(lastAssignee)) {
    return assignedTo[0];
  }

  // Get index of last assignee and return next in rotation
  const currentIndex = assignedTo.indexOf(lastAssignee);
  const nextIndex = (currentIndex + 1) % assignedTo.length;
  return assignedTo[nextIndex];
};

/**
 * Get rotation schedule for upcoming chores
 */
export const getRotationSchedule = (
  assignedTo: string[],
  startAssignee: string,
  numberOfChores: number = 10
): string[] => {
  const schedule: string[] = [];
  let currentAssignee = startAssignee;

  for (let i = 0; i < numberOfChores; i++) {
    schedule.push(currentAssignee);
    currentAssignee = getNextAssigneeInRotation(assignedTo, currentAssignee);
  }

  return schedule;
};

/**
 * Calculate who has the most chores assigned
 */
export const calculateChoreLoad = (assignments: string[]): Record<string, number> => {
  const load: Record<string, number> = {};

  for (const person of assignments) {
    load[person] = (load[person] || 0) + 1;
  }

  return load;
};

/**
 * Get person with least chores
 */
export const getPersonWithLeastChores = (assignments: string[]): string => {
  const load = calculateChoreLoad(assignments);
  const sortedByLoad = Object.entries(load).sort(([, a], [, b]) => a - b);

  return sortedByLoad[0]?.[0] || '';
};

/**
 * Format assignee display name (or fallback to first part of email)
 */
export const formatAssigneeName = (displayName: string, email?: string): string => {
  if (displayName && displayName.trim()) {
    return displayName;
  }
  if (email) {
    return email.split('@')[0];
  }
  return 'Unknown';
};

/**
 * Validate rotation setup
 */
export const isValidRotation = (assignedTo: string[]): boolean => {
  if (!Array.isArray(assignedTo)) return false;
  if (assignedTo.length === 0) return false;
  return new Set(assignedTo).size === assignedTo.length; // No duplicates
};
