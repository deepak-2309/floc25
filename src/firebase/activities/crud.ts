import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config';
import { getCurrentUserData, getCurrentUserOrThrow } from '../authUtils';
import { Activity } from '../../types';

/**
 * Activity CRUD operations - Create, Update, Delete
 */

/**
 * Creates a new activity in Firestore
 * @param activityData The activity data without an ID
 * @returns The ID of the created activity
 * @throws Error if user is not authenticated
 */
export const writeActivity = async (activityData: {
    name: string;
    location: string;
    dateTime: Date;
    description: string;
    isPrivate?: boolean;
    isPaid?: boolean;
    cost?: number;
    currency?: string;
}): Promise<string> => {
    const currentUser = getCurrentUserOrThrow();
    const userData = await getCurrentUserData();
    const creatorName = userData?.username || 'Anonymous';

    const docRef = await addDoc(collection(db, 'activities'), {
        name: activityData.name,
        location: activityData.location,
        description: activityData.description,
        dateTime: activityData.dateTime.toISOString(),
        createdAt: new Date().toISOString(),
        userId: currentUser.uid,
        createdBy: creatorName,
        isPrivate: activityData.isPrivate || false,
        isPaid: activityData.isPaid || false,
        ...(activityData.isPaid && {
            cost: activityData.cost,
            currency: activityData.currency,
            paymentDetails: {
                totalCollected: 0,
                participantCount: 0
            }
        }),
        joiners: {
            [currentUser.uid]: {
                email: currentUser.email,
                username: userData?.username || null,
                joinedAt: new Date().toISOString(),
                ...(activityData.isPaid && {
                    paymentStatus: 'completed' as const,
                    paidAmount: 0, // Creator doesn't pay
                    paidAt: new Date()
                })
            }
        }
    });

    return docRef.id;
};

/**
 * Updates an existing activity in Firestore
 * @param activity The activity data with ID
 * @throws Error if user is not authenticated or not the owner of the activity
 */
export const updateActivity = async (activity: Activity): Promise<void> => {
    const currentUser = getCurrentUserOrThrow();

    try {
        const activityRef = doc(db, 'activities', activity.id);
        const activityDoc = await getDoc(activityRef);

        if (!activityDoc.exists()) {
            throw new Error('Activity not found');
        }

        if (activityDoc.data().userId !== currentUser.uid) {
            throw new Error('You can only update your own activities');
        }

        await updateDoc(activityRef, {
            name: activity.name,
            location: activity.location,
            description: activity.description,
            dateTime: activity.dateTime.toISOString(),
            isPrivate: activity.isPrivate || false,
            isPaid: activity.isPaid || false,
            ...(activity.isPaid && {
                cost: activity.cost,
                currency: activity.currency || 'INR',
            }),
            ...(!activity.isPaid && {
                cost: null,
                currency: null,
            }),
        });

        console.log('Activity updated successfully');
    } catch (error) {
        console.error('Error updating activity:', error);
        throw error;
    }
};

/**
 * Deletes an activity from Firestore
 * @param activityId The ID of the activity to delete
 * @throws Error if user is not authenticated or not the owner of the activity
 */
export const deleteActivity = async (activityId: string): Promise<void> => {
    const currentUser = getCurrentUserOrThrow();

    try {
        const activityRef = doc(db, 'activities', activityId);
        const activityDoc = await getDoc(activityRef);

        if (!activityDoc.exists()) {
            throw new Error('Activity not found');
        }

        if (activityDoc.data().userId !== currentUser.uid) {
            throw new Error('You can only delete your own activities');
        }

        await deleteDoc(activityRef);
        console.log('Activity deleted successfully');
    } catch (error) {
        console.error('Error deleting activity:', error);
        throw error;
    }
};
