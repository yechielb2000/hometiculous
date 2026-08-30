/**
 * Format date to readable string
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get days until due date
 */
export const getDaysUntilDue = (dueDate: string): number => {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Check if date is overdue
 */
export const isOverdue = (dueDate: string): boolean => {
  return getDaysUntilDue(dueDate) < 0;
};

/**
 * Format days until due as string
 */
export const formatDaysUntilDue = (dueDate: string): string => {
  const days = getDaysUntilDue(dueDate);
  if (days < 0) {
    return `Overdue by ${Math.abs(days)} days`;
  }
  if (days === 0) {
    return 'Due today';
  }
  if (days === 1) {
    return 'Due tomorrow';
  }
  return `Due in ${days} days`;
};

/**
 * Calculate age of item (e.g., "2 days ago")
 */
export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (seconds < 2592000) {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  const months = Math.floor(seconds / 2592000);
  return `${months} month${months > 1 ? 's' : ''} ago`;
};

/**
 * Add days to a date
 */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Calculate next occurrence based on frequency
 */
export const getNextOccurrence = (
  frequencyValue: number,
  frequencyUnit: string
): Date => {
  const now = new Date();
  const next = new Date(now);

  switch (frequencyUnit) {
    case 'DAYS':
      next.setDate(next.getDate() + frequencyValue);
      break;
    case 'WEEKS':
      next.setDate(next.getDate() + frequencyValue * 7);
      break;
    case 'MONTHS':
      next.setMonth(next.getMonth() + frequencyValue);
      break;
  }

  return next;
};

/**
 * Format frequency for display
 */
export const formatFrequency = (value: number, unit: string): string => {
  const unitLabel =
    unit === 'DAYS'
      ? `day${value > 1 ? 's' : ''}`
      : unit === 'WEEKS'
        ? `week${value > 1 ? 's' : ''}`
        : `month${value > 1 ? 's' : ''}`;
  return `Every ${value} ${unitLabel}`;
};
