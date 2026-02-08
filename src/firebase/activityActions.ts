/**
 * Activity Actions - Barrel Export
 * 
 * This file re-exports all activity operations from the modular activities/ directory.
 * Maintained for backward compatibility with existing imports.
 * 
 * For new code, prefer importing from './activities' directly.
 * 
 * @deprecated Import from './activities' instead
 */

// Re-export everything from the modular activities directory
export {
  // CRUD operations
  writeActivity,
  updateActivity,
  deleteActivity,
  // Query operations
  fetchUserActivities,
  fetchConnectionsActivities,
  fetchActivityById,
  fetchUserProfileActivities,
  // Join/Leave operations
  joinActivity,
  leaveActivity,
  hasUserJoined,
} from './activities';