/**
 * Activity Firebase operations
 * 
 * This module provides all activity-related Firebase operations:
 * - CRUD: Create, Update, Delete activities
 * - Queries: Fetch user activities, connections activities, by ID, profile activities
 * - Joins: Join, Leave, and check join status
 */

// CRUD operations
export { writeActivity, updateActivity, deleteActivity } from './crud';

// Query operations
export {
    fetchUserActivities,
    fetchConnectionsActivities,
    fetchActivityById,
    fetchUserProfileActivities,
} from './queries';

// Join/Leave operations
export { joinActivity, leaveActivity, hasUserJoined } from './joins';
