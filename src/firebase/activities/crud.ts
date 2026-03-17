import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config';
import { getCurrentUserData, getCurrentUserOrThrow } from '../authUtils';
import { Activity } from '../../types';

/**
 * Activity CRUD operations - Create, Update, Delete/Cancel
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
    maxParticipants?: number;
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
        status: 'active',
        ...(activityData.maxParticipants != null && { maxParticipants: activityData.maxParticipants }),
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
                    paidAmount: 0,
                    paidAt: new Date().toISOString()
                })
            }
        }
    });

    return docRef.id;
};

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
            ...(activity.maxParticipants != null
                ? { maxParticipants: activity.maxParticipants }
                : { maxParticipants: null }),
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
 * Soft-cancels an activity by setting status to 'cancelled'.
 * The Firestore document is NOT deleted.
 * For paid events, callers should trigger refunds before or after calling this.
 */
export const cancelActivity = async (activityId: string): Promise<void> => {
    const currentUser = getCurrentUserOrThrow();

    try {
        const activityRef = doc(db, 'activities', activityId);
        const activityDoc = await getDoc(activityRef);

        if (!activityDoc.exists()) {
            throw new Error('Activity not found');
        }

        if (activityDoc.data().userId !== currentUser.uid) {
            throw new Error('You can only cancel your own activities');
        }

        await updateDoc(activityRef, { status: 'cancelled' });
        console.log('Activity cancelled successfully');
    } catch (error) {
        console.error('Error cancelling activity:', error);
        throw error;
    }
};

/**
 * Hard-deletes an activity. Only allowed for free (non-paid) activities
 * or activities with no paid participants.
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
