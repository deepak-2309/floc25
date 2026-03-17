import { doc, getDoc, updateDoc, serverTimestamp, deleteField } from 'firebase/firestore';
import { db, auth } from '../config';
import { getCurrentUserData, getCurrentUserOrThrow } from '../authUtils';
import { Activity, DepartedJoiner } from '../../types';
import { initiatePayment, hasUserPaid } from '../paymentService';

/**
 * Activity join/leave operations
 */

/**
 * Joins an activity by adding the current user to its joiners list.
 * For paid activities, initiates payment flow.
 * Enforces capacity limits and re-join policy for departed participants.
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

        // Block joining cancelled/completed events
        if (activityData.status === 'cancelled') {
            throw new Error('This event has been cancelled.');
        }
        if (activityData.status === 'completed') {
            throw new Error('This event has already completed.');
        }

        const creatorId = activityData.userId;

        // Capacity check (skip for creator)
        if (creatorId !== currentUser.uid && activityData.maxParticipants) {
            const activeJoinerCount = Object.keys(activityData.joiners || {}).length;
            if (activeJoinerCount >= activityData.maxParticipants) {
                throw new Error('This event is full.');
            }
        }

        // Re-join policy: check departedJoiners
        if (creatorId !== currentUser.uid) {
            const departed = activityData.departedJoiners?.[currentUser.uid];
            if (departed) {
                if (departed.refundStatus === 'pending') {
                    throw new Error("You can't rejoin while your refund request is pending.");
                }
                // 'completed' or 'declined' → allow rejoin (fall through to normal join flow)
            }
        }

        // Check if activity is paid and user hasn't paid yet
        if (activityData.isPaid && creatorId !== currentUser.uid) {
            const hasAlreadyPaid = hasUserPaid(activityData, currentUser.uid);

            if (!hasAlreadyPaid) {
                // Initiate payment flow (handles joining after success)
                await initiatePayment(activityId, activityData.name, activityData.cost);
                return;
            }
        }

        // Optionally connect with creator
        const isConnected = userData?.connections && userData.connections[creatorId];
        if (!isConnected && shouldConnect && creatorId !== currentUser.uid) {
            const creatorDoc = await getDoc(doc(db, 'users', creatorId));
            if (!creatorDoc.exists()) {
                throw new Error('Activity creator not found');
            }
            const creatorData = creatorDoc.data();

            const currentUserRef = doc(db, 'users', currentUser.uid);
            await updateDoc(currentUserRef, {
                [`connections.${creatorId}`]: {
                    email: creatorData.email,
                    username: creatorData.username || null,
                    connectedAt: serverTimestamp()
                }
            });

            const creatorRef = doc(db, 'users', creatorId);
            await updateDoc(creatorRef, {
                [`connections.${currentUser.uid}`]: {
                    email: currentUser.email,
                    username: userData?.username || null,
                    connectedAt: serverTimestamp()
                }
            });
        }

        // Build joiner entry
        const joinerData: any = {
            email: currentUser.email,
            username: userData?.username || null,
            joinedAt: new Date().toISOString()
        };

        if (activityData.isPaid && !activityData.joiners?.[currentUser.uid]?.paymentStatus) {
            joinerData.paymentStatus = 'completed';
            joinerData.paidAmount = activityData.cost;
            joinerData.paidAt = new Date().toISOString();
        }

        // Remove from departedJoiners if re-joining
        const updatePayload: any = {
            [`joiners.${currentUser.uid}`]: joinerData
        };
        if (activityData.departedJoiners?.[currentUser.uid]) {
            updatePayload[`departedJoiners.${currentUser.uid}`] = deleteField();
        }

        await updateDoc(activityRef, updatePayload);

        console.log('Successfully joined activity');
    } catch (error) {
        console.error('Error joining activity:', error);
        throw error;
    }
};

/**
 * Leaves an activity. For paid activities, moves the user to departedJoiners
 * with refundStatus 'pending'. For free activities, refundStatus is 'n/a'.
 */
export const leaveActivity = async (activityId: string): Promise<void> => {
    const currentUser = getCurrentUserOrThrow();

    try {
        const activityRef = doc(db, 'activities', activityId);
        const activityDoc = await getDoc(activityRef);

        if (!activityDoc.exists()) {
            throw new Error('Activity not found');
        }

        const activityData = activityDoc.data();
        const joiner = activityData.joiners?.[currentUser.uid];

        if (!joiner) {
            throw new Error('You are not a participant of this activity.');
        }

        const isPaid = activityData.isPaid && joiner.paidAmount > 0;

        const departedEntry: DepartedJoiner = {
            email: joiner.email,
            username: joiner.username || null,
            joinedAt: joiner.joinedAt,
            departedAt: new Date().toISOString(),
            departedReason: 'left',
            paidAmount: joiner.paidAmount || 0,
            paymentId: joiner.paymentId,
            refundStatus: isPaid ? 'pending' : 'n/a',
        };

        await updateDoc(activityRef, {
            [`joiners.${currentUser.uid}`]: deleteField(),
            [`departedJoiners.${currentUser.uid}`]: departedEntry,
        });

        console.log('Successfully left activity');
    } catch (error) {
        console.error('Error leaving activity:', error);
        throw error;
    }
};

/**
 * Creator kicks a participant from an activity.
 * Moves them to departedJoiners with reason 'removed_by_creator'.
 * If issueRefund is true, triggers the refund flow (sets refundStatus 'pending' for manual refund handling).
 */
export const removeParticipant = async (
    activityId: string,
    targetUserId: string,
    issueRefund: boolean
): Promise<void> => {
    getCurrentUserOrThrow();

    try {
        const activityRef = doc(db, 'activities', activityId);
        const activityDoc = await getDoc(activityRef);

        if (!activityDoc.exists()) {
            throw new Error('Activity not found');
        }

        const activityData = activityDoc.data();
        const joiner = activityData.joiners?.[targetUserId];

        if (!joiner) {
            throw new Error('Participant not found.');
        }

        const isPaid = activityData.isPaid && joiner.paidAmount > 0;

        const departedEntry: DepartedJoiner = {
            email: joiner.email,
            username: joiner.username || null,
            joinedAt: joiner.joinedAt,
            departedAt: new Date().toISOString(),
            departedReason: 'removed_by_creator',
            paidAmount: joiner.paidAmount || 0,
            paymentId: joiner.paymentId,
            refundStatus: isPaid
                ? (issueRefund ? 'pending' : 'declined')
                : 'n/a',
        };

        await updateDoc(activityRef, {
            [`joiners.${targetUserId}`]: deleteField(),
            [`departedJoiners.${targetUserId}`]: departedEntry,
        });

        console.log('Participant removed successfully');
    } catch (error) {
        console.error('Error removing participant:', error);
        throw error;
    }
};

/**
 * Checks if the current user has joined an activity.
 */
export const hasUserJoined = (activity: Activity): boolean => {
    const currentUser = auth.currentUser;
    if (!currentUser || !activity.joiners) {
        return false;
    }
    return !!activity.joiners[currentUser.uid];
};
