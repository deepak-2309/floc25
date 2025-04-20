import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Activity } from '../types/Activity';

const ACTIVITIES_COLLECTION = 'activities';

export const addActivity = async (activity: Omit<Activity, 'id'>, userId: string) => {
  try {
    console.log('Adding activity:', { ...activity, userId });
    const docRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), {
      ...activity,
      createdBy: userId,
      createdAt: Timestamp.now()
    });
    console.log('Activity added successfully:', docRef.id);
    return { id: docRef.id, ...activity };
  } catch (error) {
    console.error('Error adding activity:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to add activity: ${error.message}`);
    }
    throw error;
  }
};

export const getMyActivities = async (userId: string) => {
  try {
    console.log('Fetching activities for user:', userId);
    const activitiesRef = collection(db, ACTIVITIES_COLLECTION);
    
    // Log the query parameters
    console.log('Query parameters:', {
      collection: ACTIVITIES_COLLECTION,
      createdBy: userId,
      orderBy: 'datetime'
    });
    
    // First try with the compound query
    try {
      const q = query(
        activitiesRef,
        where('createdBy', '==', userId),
        orderBy('datetime', 'desc')
      );
      
      console.log('Executing Firestore query...');
      const querySnapshot = await getDocs(q);
      console.log('Query executed successfully');
      console.log('Found activities:', querySnapshot.size);
      
      const activities = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing document:', doc.id, data);
        return {
          id: doc.id,
          ...data
        };
      }) as Activity[];
      
      console.log('Processed activities:', activities);
      return activities;
    } catch (indexError: any) {
      // If we get a missing index error, fall back to a simpler query
      if (indexError.code === 'failed-precondition') {
        console.log('Index not ready, falling back to basic query...');
        const basicQuery = query(
          activitiesRef,
          where('createdBy', '==', userId)
        );
        
        const querySnapshot = await getDocs(basicQuery);
        const activities = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Activity[];
        
        // Sort the activities in memory
        activities.sort((a, b) => 
          new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
        );
        
        return activities;
      }
      throw indexError; // If it's not an indexing error, rethrow it
    }
  } catch (error) {
    console.error('Detailed error in getMyActivities:', {
      error,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorCode: (error as any)?.code,
      userId
    });
    
    if (error instanceof Error) {
      // Check for specific Firestore error codes
      const code = (error as any).code;
      if (code === 'permission-denied') {
        throw new Error('permission-denied: You do not have permission to access these activities.');
      } else if (code === 'unavailable') {
        throw new Error('network: The service is currently unavailable. Please try again later.');
      } else if (code === 'not-found') {
        throw new Error('not-found: The requested collection was not found.');
      } else if (code === 'unauthenticated') {
        throw new Error('auth: Authentication is required to access activities.');
      }
      throw new Error(`firestore: ${error.message}`);
    }
    throw error;
  }
};

export const getUserName = async (userId: string): Promise<string> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data()?.name || userId;
    }
    return userId;
  } catch (error) {
    console.error('Error fetching user name:', error);
    return userId;
  }
};

export const getFriendsActivities = async (userId: string): Promise<Activity[]> => {
  try {
    // Get user's connections
    const connectionsQuery = query(
      collection(db, 'connections'),
      where('userId', '==', userId)
    );
    const connectionsSnapshot = await getDocs(connectionsQuery);
    const connectionEmails = connectionsSnapshot.docs.map(doc => doc.data().email);

    // Get activities from users who have these emails
    const activitiesQuery = query(
      collection(db, 'activities'),
      where('userEmail', 'in', connectionEmails)
    );
    const activitiesSnapshot = await getDocs(activitiesQuery);
    
    // Get activities and fetch user names
    const activities = await Promise.all(
      activitiesSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userName = await getUserName(data.userId);
        return {
          id: doc.id,
          ...data,
          createdBy: userName
        } as Activity;
      })
    );

    return activities.sort((a, b) => 
      new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
    );
  } catch (error) {
    console.error('Error fetching friends activities:', error);
    throw error;
  }
};

export const deleteActivity = async (activityId: string) => {
  try {
    console.log('Deleting activity:', activityId);
    await deleteDoc(doc(db, ACTIVITIES_COLLECTION, activityId));
    console.log('Activity deleted successfully');
  } catch (error) {
    console.error('Error deleting activity:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to delete activity: ${error.message}`);
    }
    throw error;
  }
};

export const updateActivity = async (activityId: string, updates: Partial<Activity>) => {
  try {
    console.log('Updating activity:', activityId, updates);
    const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
    await updateDoc(activityRef, updates);
    console.log('Activity updated successfully');
  } catch (error) {
    console.error('Error updating activity:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to update activity: ${error.message}`);
    }
    throw error;
  }
}; 