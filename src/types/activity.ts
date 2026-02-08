/**
 * Activity-related type definitions for Floc
 */

/**
 * Represents a joiner entry for an activity.
 * Contains user details and optional payment information.
 */
export interface ActivityJoiner {
    email: string;
    username?: string;
    joinedAt: Date;
    paymentStatus?: 'pending' | 'completed' | 'failed';
    paymentId?: string;
    razorpayOrderId?: string;
    paidAmount?: number;
    paidAt?: Date;
}

/**
 * Payment tracking details for paid activities.
 */
export interface PaymentDetails {
    totalCollected?: number;
    participantCount?: number;
}

/**
 * Interface representing an activity in the application.
 * Contains all necessary information about a single activity.
 */
export interface Activity {
    id: string;           // Unique identifier for the activity
    name: string;         // Name/title of the activity
    createdBy: string;    // Name of the user who created the activity
    userId: string;       // ID of the user who created the activity
    location: string;     // Location where the activity will take place
    dateTime: Date;       // Date and time when the activity is scheduled
    description: string;  // Description of the activity
    allowJoin?: boolean;  // Whether the current user is allowed to join this activity
    isPrivate?: boolean;  // Whether the activity is marked as private
    isPaid?: boolean;     // Whether the activity requires payment to join
    cost?: number;        // Cost in INR (stored in paise for Razorpay)
    currency?: string;    // Currency code (e.g., 'INR')
    paymentDetails?: PaymentDetails;
    joiners?: {
        [userId: string]: ActivityJoiner;
    };
}

/**
 * Input type for creating a new activity (without id, userId, createdBy).
 */
export type CreateActivityInput = Omit<Activity, 'id' | 'userId' | 'createdBy'>;
