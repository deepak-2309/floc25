import { collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc, deleteDoc, deleteField } from 'firebase/firestore';
import { db } from './config';
import { getCurrentUserData, getCurrentUserOrThrow } from './authUtils';
import { Activity } from '../components/ActivityCard'; // Assuming ActivityCard is one level up

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
}) => {
  const currentUser = getCurrentUserOrThrow();
  const userData = await getCurrentUserData();
  const creatorName = userData?.username || 'Anonymous';

  const docRef = await addDoc(collection(db, 'activities'), {
    ...activityData,
    dateTime: activityData.dateTime.toISOString(),
    createdAt: new Date().toISOString(),
    userId: currentUser.uid,
    createdBy: creatorName,
    joiners: {
      [currentUser.uid]: {
        email: currentUser.email,
        username: userData?.username || null,
        joinedAt: new Date().toISOString()
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
 * Fetches activities created by the user's connections that the user hasn't joined
 * @returns Array of activities from connected users
 * @throws Error if user is not authenticated
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
    const q = query(
      activitiesRef,
      where('userId', 'in', connectedUserIds)
    );

    const querySnapshot = await getDocs(q);

    const activities = querySnapshot.docs
      .map(doc => {
        const activityData = doc.data() as Omit<Activity, 'id'>;
        const creatorId = activityData.userId;
        const creatorInfo = userData.connections[creatorId];

        // Handle case where creatorInfo might be missing (though unlikely if connections are synced)
        const createdByName = creatorInfo ? (creatorInfo.username || creatorInfo.email) : 'Unknown User';

        return {
          ...activityData,
          id: doc.id,
          dateTime: new Date(activityData.dateTime),
          createdBy: createdByName
        } as Activity;
      })
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
    });

    console.log('Activity updated successfully');
  } catch (error) {
    console.error('Error updating activity:', error);
    throw error;
  }
};

/**
 * Joins an activity by adding the current user to its joiners list
 * @param activityId The ID of the activity to join
 * @throws Error if user is not authenticated
 */
export const joinActivity = async (activityId: string) => {
  const currentUser = getCurrentUserOrThrow();
  const userData = await getCurrentUserData();

  try {
    const activityRef = doc(db, 'activities', activityId);
    await updateDoc(activityRef, {
      [`joiners.${currentUser.uid}`]: {
        email: currentUser.email,
        username: userData?.username || null,
        joinedAt: new Date().toISOString()
      }
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
    await updateDoc(activityRef, {
      [`joiners.${currentUser.uid}`]: deleteField()
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
  // Import auth directly for this synchronous check
  const { auth } = require('./config'); 
  const currentUser = auth.currentUser; 
  if (!currentUser || !activity.joiners) {
    return false;
  }
  return !!activity.joiners[currentUser.uid];
}; 