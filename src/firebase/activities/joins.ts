import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../config';
import { getCurrentUserData, getCurrentUserOrThrow } from '../authUtils';
import { Activity } from '../../types';
import { initiatePayment, hasUserPaid } from '../paymentService';

/**
 * Activity join/leave operations
 */

/**
 * Joins an activity by adding the current user to its joiners list
 * For paid activities, initiates payment flow
 * If the user is not connected to the activity creator, they will be connected
 * @param activityId The ID of the activity to join
 * @param shouldConnect Whether to connect with the creator (defaults to false)
 * @throws Error if user is not authenticated
 */
export const joinActivity = async (activityId: string, shouldConnect: boolean = false): Promise<void> => {
    const currentUser = getCurrentUserOrThrow();
    const userData = await getCurrentUserData();

    try {
        const activityRef = doc(db, 'activities', activityId);
        const activityDoc = await getDoc(activityRef);

        if (!activityDoc.exists()) {
            throw new Error('Activity not found');
        }

        const activityData = activityDoc.data();
        const creatorId = activityData.userId;

        // Check if activity is paid and user hasn't paid yet
        if (activityData.isPaid && creatorId !== currentUser.uid) {
            const hasAlreadyPaid = hasUserPaid(activityData, currentUser.uid);

            if (!hasAlreadyPaid) {
                // Initiate payment flow
                await initiatePayment(
                    activityId,
                    activityData.name,
                    activityData.cost
                );

                // Payment flow will handle joining after successful payment
                return;
            }
        }

        // Check if user is already connected to creator
        const isConnected = userData?.connections && userData.connections[creatorId];

        // If not connected and shouldConnect is true, establish connection
        if (!isConnected && shouldConnect && creatorId !== currentUser.uid) {
            const creatorDoc = await getDoc(doc(db, 'users', creatorId));
            if (!creatorDoc.exists()) {
                throw new Error('Activity creator not found');
            }
            const creatorData = creatorDoc.data();

            // Add connection to current user's document
            const currentUserRef = doc(db, 'users', currentUser.uid);
            await updateDoc(currentUserRef, {
                [`connections.${creatorId}`]: {
                    email: creatorData.email,
                    username: creatorData.username || null,
                    connectedAt: serverTimestamp()
                }
            });

            // Add connection to creator's document
            const creatorRef = doc(db, 'users', creatorId);
            await updateDoc(creatorRef, {
                [`connections.${currentUser.uid}`]: {
                    email: currentUser.email,
                    username: userData?.username || null,
                    connectedAt: serverTimestamp()
                }
            });
        }

        // Join the activity
        const joinerData: any = {
            email: currentUser.email,
            username: userData?.username || null,
            joinedAt: new Date().toISOString()
        };

        // For paid activities, add payment status if not already set
        if (activityData.isPaid && !activityData.joiners?.[currentUser.uid]?.paymentStatus) {
            joinerData.paymentStatus = 'completed';
            joinerData.paidAmount = activityData.cost;
            joinerData.paidAt = new Date().toISOString();
        }

        await updateDoc(activityRef, {
            [`joiners.${currentUser.uid}`]: joinerData
        });

        console.log('Successfully joined activity');
    } catch (error) {
        console.error('Error joining activity:', error);
        throw error;
    }
};

/**
 * Leaves an activity by removing the current user from its joiners list
 * @param activityId The ID of the activity to leave
 * @throws Error if user is not authenticated
 */
export const leaveActivity = async (activityId: string): Promise<void> => {
    const currentUser = getCurrentUserOrThrow();

    try {
        const activityRef = doc(db, 'activities', activityId);
        const activityDoc = await getDoc(activityRef);

        if (!activityDoc.exists()) {
            throw new Error('Activity not found');
        }

        // Get current joiners and remove the current user
        const currentJoiners = activityDoc.data().joiners || {};
        const { [currentUser.uid]: removed, ...remainingJoiners } = currentJoiners;

        await updateDoc(activityRef, {
            joiners: remainingJoiners
        });

        console.log('Successfully left activity');
    } catch (error) {
        console.error('Error leaving activity:', error);
        throw error;
    }
};

/**
 * Checks if the current user has joined an activity
 * @param activity The activity to check
 * @returns boolean indicating if the current user has joined
 */
export const hasUserJoined = (activity: Activity): boolean => {
    const currentUser = auth.currentUser;
    if (!currentUser || !activity.joiners) {
        return false;
    }
    return !!activity.joiners[currentUser.uid];
};
