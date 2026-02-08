/**
 * User and connection-related type definitions for Floc
 */

/**
 * Represents a user connection (stored in Firestore).
 */
export interface UserConnection {
    email: string;
    username: string | null;
    connectedAt: any; // Firebase Timestamp
}

/**
 * Map of user connections keyed by userId.
 */
export interface UserConnections {
    [userId: string]: UserConnection;
}

/**
 * Represents a connection in the UI with additional display fields.
 */
export interface Connection {
    id: string;
    userId: string;
    email: string | null;
    username: string | null;
    connectedAt: any;
    isMutual?: boolean;      // Whether this is a mutual connection
    isCurrentUser?: boolean; // Whether this is the current logged-in user
}

/**
 * User profile data returned from Firestore.
 */
export interface UserProfile {
    id: string;
    username: string | null;
    email: string | null;
}
