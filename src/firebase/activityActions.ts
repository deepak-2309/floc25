import { collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc, deleteDoc, deleteField, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './config';
import { getCurrentUserData, getCurrentUserOrThrow } from './authUtils';
import { Activity } from '../components/ActivityCard'; // Assuming ActivityCard is one level up
import { initiatePayment, hasUserPaid } from './paymentService';

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
}) => {
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
 * Fetches all activities that the current user has created or joined
 * @returns Array of activities
 * @throws Error if user is not authenticated
 */
export const fetchUserActivities = async () => {
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
 * Deletes an activity from Firestore
 * @param activityId The ID of the activity to delete
 * @throws Error if user is not authenticated or not the owner of the activity
 */
export const deleteActivity = async (activityId: string) => {
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

/**
 * Fetches activities that are either created by or joined by the user's connections 
 * that the user hasn't joined and are not marked as private
 * @returns Array of activities from connected users
 * @throws Error if user is not authenticated
 * 
 * SECURITY NOTE: Filtering of private activities MUST be done client-side.
 * Firestore security rules cannot filter documents by field content in collection queries.
 * The rules can block document-level access, but for queries, we must filter in the client code.
 */
export const fetchConnectionsActivities = async () => {
  const currentUser = getCurrentUserOrThrow();
  const userData = await getCurrentUserData();

  try {
    if (!userData?.connections) {
      return [];
    }

    const connectedUserIds = Object.keys(userData.connections);
    if (connectedUserIds.length === 0) {
      return []; // Return early if no connected user IDs
    }

    const activitiesRef = collection(db, 'activities');

    // Get activities created by connections
    const createdByConnectionsQuery = query(
      activitiesRef,
      where('userId', 'in', connectedUserIds)
    );
    const createdByConnectionsSnapshot = await getDocs(createdByConnectionsQuery);

    // Get activities joined by connections
    // We need to do this in batches since we can't use array-contains-any with arrays
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
      // This filtering MUST happen client-side since Firestore rules can't filter by fields in queries
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
        allowJoin: true // Allow joining activities created by connections
      });
    });

    // Process activities joined by connections
    joinedByConnectionsSnapshots.forEach(snapshot => {
      snapshot.docs.forEach(doc => {
        if (!activitiesMap.has(doc.id)) {
          const activityData = doc.data();
          // CRITICAL SECURITY FILTER: Skip private activities
          // This filtering MUST happen client-side since Firestore rules can't filter by fields in queries
          if (activityData.isPrivate) {
            return;
          }

          // For activities only joined by connections (not created), don't allow current user to join
          activitiesMap.set(doc.id, {
            ...activityData,
            id: doc.id,
            dateTime: new Date(activityData.dateTime),
            allowJoin: false // Don't allow joining activities only joined by connections
          });
        }
      });
    });

    // Convert map to array and filter out activities user has already joined
    const activities = Array.from(activitiesMap.values())
      .filter(activity => !activity.joiners || !activity.joiners[currentUser.uid]);

    return activities;
  } catch (error) {
    console.error('Error fetching connections activities:', error);
    throw error;
  }
};

/**
 * Updates an existing activity in Firestore
 * @param activity The activity data with ID
 * @throws Error if user is not authenticated or not the owner of the activity
 */
export const updateActivity = async (activity: Activity) => {
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
    });

    console.log('Activity updated successfully');
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

/**
 * Joins an activity by adding the current user to its joiners list
 * For paid activities, initiates payment flow
 * If the user is not connected to the activity creator, they will be connected
 * @param activityId The ID of the activity to join
 * @param shouldConnect Whether to connect with the creator (defaults to false)
 * @throws Error if user is not authenticated
 */
export const joinActivity = async (activityId: string, shouldConnect: boolean = false) => {
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
        // Exit here to let payment flow complete
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

    // Join the activity (for free activities or after payment is complete)
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
export const leaveActivity = async (activityId: string) => {
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

    // Update with the new joiners object
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

/**
 * Fetches past activities for the current user (both created and joined)
 * @returns Array of past activities
 * @throws Error if user is not authenticated
 */
export const fetchPastActivities = async () => {
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
    const now = new Date();

    // Process created activities
    createdActivitiesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const activityDate = new Date(data.dateTime);
      if (activityDate < now) {
        activitiesMap.set(doc.id, {
          id: doc.id,
          ...data,
          dateTime: activityDate
        });
      }
    });

    // Process joined activities
    joinedActivitiesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const activityDate = new Date(data.dateTime);
      if (activityDate < now && !activitiesMap.has(doc.id)) {
        activitiesMap.set(doc.id, {
          id: doc.id,
          ...data,
          dateTime: activityDate
        });
      }
    });

    return Array.from(activitiesMap.values())
      .sort((a, b) => b.dateTime.getTime() - a.dateTime.getTime()); // Sort by most recent first
  } catch (error) {
    console.error('Error fetching past activities:', error);
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
export const fetchActivityById = async (activityId: string) => {
  getCurrentUserOrThrow(); // Ensure user is authenticated

  try {
    const activityRef = doc(db, 'activities', activityId);
    const activityDoc = await getDoc(activityRef);

    if (!activityDoc.exists()) {
      return null; // Activity not found
    }

    const data = activityDoc.data();
    return {
      id: activityId,
      ...data,
      dateTime: new Date(data.dateTime)
    } as Activity;
  } catch (error) {
    console.error('Error fetching activity by ID:', error);
    throw error;
  }
}; 