import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config';
import { getCurrentUserData, getCurrentUserOrThrow } from '../authUtils';
import { Activity } from '../../types';
import { getSafeDate } from '../../utils/dateUtils';

/**
 * Activity query functions - fetching activities
 */

/**
 * Fetches all activities that the current user has created or joined
 * @returns Array of activities
 * @throws Error if user is not authenticated
 */
export const fetchUserActivities = async (): Promise<Activity[]> => {
    const currentUser = getCurrentUserOrThrow();

    try {
        const activitiesRef = collection(db, 'activities');
        const createdActivitiesQuery = query(
            activitiesRef,
            where('userId', '==', currentUser.uid)
        );
        const createdActivitiesSnapshot = await getDocs(createdActivitiesQuery);

        const joinedActivitiesQuery = query(
            activitiesRef,
            where(`joiners.${currentUser.uid}`, '!=', null)
        );
        const joinedActivitiesSnapshot = await getDocs(joinedActivitiesQuery);

        const activitiesMap = new Map();
        createdActivitiesSnapshot.docs.forEach(doc => {
            activitiesMap.set(doc.id, {
                id: doc.id,
                ...doc.data(),
                dateTime: new Date(doc.data().dateTime)
            });
        });

        joinedActivitiesSnapshot.docs.forEach(doc => {
            if (!activitiesMap.has(doc.id)) {
                activitiesMap.set(doc.id, {
                    id: doc.id,
                    ...doc.data(),
                    dateTime: new Date(doc.data().dateTime)
                });
            }
        });

        return Array.from(activitiesMap.values()) as Activity[];
    } catch (error) {
        console.error('Error fetching user activities:', error);
        throw error;
    }
};

/**
 * Fetches activities that are either created by or joined by the user's connections 
 * that the user hasn't joined and are not marked as private
 * @returns Array of activities from connected users
 * @throws Error if user is not authenticated
 * 
 * SECURITY NOTE: Filtering of private activities MUST be done client-side.
 * Firestore security rules cannot filter documents by field content in collection queries.
 */
export const fetchConnectionsActivities = async (): Promise<Activity[]> => {
    const currentUser = getCurrentUserOrThrow();
    const userData = await getCurrentUserData();

    try {
        if (!userData?.connections) {
            return [];
        }

        const connectedUserIds = Object.keys(userData.connections);
        if (connectedUserIds.length === 0) {
            return [];
        }

        const activitiesRef = collection(db, 'activities');

        // Get activities created by connections
        const createdByConnectionsQuery = query(
            activitiesRef,
            where('userId', 'in', connectedUserIds)
        );
        const createdByConnectionsSnapshot = await getDocs(createdByConnectionsQuery);

        // Get activities joined by connections
        const joinedByConnectionsPromises = connectedUserIds.map(connectionId => {
            const joinedQuery = query(
                activitiesRef,
                where(`joiners.${connectionId}`, '!=', null)
            );
            return getDocs(joinedQuery);
        });
        const joinedByConnectionsSnapshots = await Promise.all(joinedByConnectionsPromises);

        // Combine all activities into a map to deduplicate
        const activitiesMap = new Map();

        // Process activities created by connections
        createdByConnectionsSnapshot.docs.forEach(doc => {
            const activityData = doc.data();
            // CRITICAL SECURITY FILTER: Skip private activities
            if (activityData.isPrivate) {
                return;
            }

            const creatorId = activityData.userId;
            const creatorInfo = userData.connections[creatorId];
            const createdByName = creatorInfo ? (creatorInfo.username || creatorInfo.email) : 'Unknown User';

            activitiesMap.set(doc.id, {
                ...activityData,
                id: doc.id,
                dateTime: new Date(activityData.dateTime),
                createdBy: createdByName,
                allowJoin: true
            });
        });

        // Process activities joined by connections
        joinedByConnectionsSnapshots.forEach(snapshot => {
            snapshot.docs.forEach(doc => {
                if (!activitiesMap.has(doc.id)) {
                    const activityData = doc.data();
                    // CRITICAL SECURITY FILTER: Skip private activities
                    if (activityData.isPrivate) {
                        return;
                    }

                    activitiesMap.set(doc.id, {
                        ...activityData,
                        id: doc.id,
                        dateTime: new Date(activityData.dateTime),
                        allowJoin: false
                    });
                }
            });
        });

        // Filter out activities user has already joined
        const activities = Array.from(activitiesMap.values())
            .filter(activity => !activity.joiners || !activity.joiners[currentUser.uid]);

        return activities;
    } catch (error) {
        console.error('Error fetching connections activities:', error);
        throw error;
    }
};

/**
 * Fetches an activity by its ID
 * @param activityId The ID of the activity to fetch
 * @returns The activity with the specified ID or null if not found
 * @throws Error if user is not authenticated
 * 
 * Note: This function allows viewing private activities when accessed directly by ID
 * This enables the sharing functionality to work for private activities
 */
export const fetchActivityById = async (activityId: string): Promise<Activity | null> => {
    getCurrentUserOrThrow();

    try {
        const activityRef = doc(db, 'activities', activityId);
        const activityDoc = await getDoc(activityRef);

        if (!activityDoc.exists()) {
            return null;
        }

        const data = activityDoc.data();
        return {
            id: activityId,
            ...data,
            dateTime: getSafeDate(data.dateTime) || new Date()
        } as Activity;
    } catch (error) {
        console.error('Error fetching activity by ID:', error);
        throw error;
    }
};

/**
 * Fetches activities for a user profile (created or joined)
 * Filters for visibility:
 * - Public activities (!isPrivate)
 * - Private activities where current viewer is a participant
 * @param profileUserId The ID of the user whose profile is being viewed
 * @returns Array of visible activities
 */
export const fetchUserProfileActivities = async (profileUserId: string): Promise<Activity[]> => {
    const currentUser = getCurrentUserOrThrow();

    try {
        const activitiesRef = collection(db, 'activities');

        // Fetch activities created by profile user
        const createdQuery = query(
            activitiesRef,
            where('userId', '==', profileUserId)
        );
        const createdSnapshot = await getDocs(createdQuery);

        // Fetch activities joined by profile user
        const joinedQuery = query(
            activitiesRef,
            where(`joiners.${profileUserId}`, '!=', null)
        );
        const joinedSnapshot = await getDocs(joinedQuery);

        const activitiesMap = new Map();
        const now = new Date();

        const processActivity = (doc: any) => {
            const data = doc.data();
            const activityId = doc.id;

            if (activitiesMap.has(activityId)) return;

            const isPublic = !data.isPrivate;
            const isViewerParticipant = data.joiners && data.joiners[currentUser.uid];
            const isViewerCreator = data.userId === currentUser.uid;

            if (isPublic || isViewerParticipant || isViewerCreator) {
                const activityDate = getSafeDate(data.dateTime);

                if (activityDate && activityDate < now) {
                    activitiesMap.set(activityId, {
                        id: activityId,
                        ...data,
                        dateTime: activityDate
                    } as Activity);
                }
            }
        };

        createdSnapshot.docs.forEach(processActivity);
        joinedSnapshot.docs.forEach(processActivity);

        return Array.from(activitiesMap.values())
            .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime());

    } catch (error) {
        console.error('Error fetching user profile activities:', error);
        throw error;
    }
};
