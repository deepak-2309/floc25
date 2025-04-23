import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp, getDoc, updateDoc, collection, addDoc, query, where, getDocs, writeBatch, deleteDoc, deleteField } from 'firebase/firestore';
import { Activity } from './components/ActivityCard';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Function to update user data in Firestore when a user is created or logs in
export const updateUserData = async (user: {
  uid: string;
  email: string | null;
}) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // For new users, set all initial fields including createdAt
      await setDoc(userRef, {
        email: user.email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        username: null // Initialize username as null for new users
      });
    } else {
      // For existing users, only update lastLogin while preserving other fields
      const userData = userDoc.data();
      await updateDoc(userRef, {
        lastLogin: serverTimestamp(),
        // Preserve the username if it exists
        ...(userData.username && { username: userData.username })
      });
    }
  } catch (error) {
    console.error('Error updating user data:', error);
  }
};

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
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in to create activities');
  }

  // Get user data to include username if available
  const userRef = doc(db, 'users', currentUser.uid);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();
  const creatorName = userData?.username || 'Anonymous';

  const docRef = await addDoc(collection(db, 'activities'), {
    ...activityData,
    dateTime: activityData.dateTime.toISOString(),
    createdAt: new Date().toISOString(),
    userId: currentUser.uid,
    createdBy: creatorName,
    // Add the creator as a joiner by default
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
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in to fetch activities');
  }

  try {
    const activitiesRef = collection(db, 'activities');
    
    // Get activities created by the user
    const createdActivitiesQuery = query(
      activitiesRef, 
      where('userId', '==', currentUser.uid)
    );
    const createdActivitiesSnapshot = await getDocs(createdActivitiesQuery);
    
    // Get activities where the user is a joiner
    const joinedActivitiesQuery = query(
      activitiesRef,
      where(`joiners.${currentUser.uid}`, '!=', null)
    );
    const joinedActivitiesSnapshot = await getDocs(joinedActivitiesQuery);
    
    // Combine and deduplicate activities
    const activitiesMap = new Map();
    
    // Add created activities
    createdActivitiesSnapshot.docs.forEach(doc => {
      activitiesMap.set(doc.id, {
        id: doc.id,
        ...doc.data(),
        dateTime: new Date(doc.data().dateTime)
      });
    });
    
    // Add joined activities
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

interface UserConnection {
  email: string;
  username: string | null;
  connectedAt: any; // Firebase Timestamp
}

interface UserConnections {
  [userId: string]: UserConnection;
}

/**
 * Adds a connection to the current user's document
 * @param targetEmail The email of the user to connect with
 * @throws Error if user is not authenticated or target user doesn't exist
 */
export const addConnection = async (targetEmail: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in to add connections');
  }

  if (targetEmail === currentUser.email) {
    throw new Error('Cannot connect with yourself');
  }

  try {
    // First, find the target user by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', targetEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('User not found');
    }

    const targetUserDoc = querySnapshot.docs[0];
    const targetUserData = targetUserDoc.data();

    // Check if connection already exists
    const currentUserRef = doc(db, 'users', currentUser.uid);
    const currentUserDoc = await getDoc(currentUserRef);
    const currentUserData = currentUserDoc.data() || {};
    
    if (currentUserData.connections && currentUserData.connections[targetUserDoc.id]) {
      throw new Error('Connection already exists');
    }

    // Create connections object if it doesn't exist
    if (!currentUserData.connections) {
      await updateDoc(currentUserRef, { connections: {} });
    }

    // Add connection to current user's document
    await updateDoc(currentUserRef, {
      [`connections.${targetUserDoc.id}`]: {
        email: targetUserData.email,
        username: targetUserData.username || null,
        connectedAt: serverTimestamp()
      }
    });

    // Create connections object in target user's document if it doesn't exist
    const targetUserRef = doc(db, 'users', targetUserDoc.id);
    const targetUserCurrentData = (await getDoc(targetUserRef)).data() || {};
    if (!targetUserCurrentData.connections) {
      await updateDoc(targetUserRef, { connections: {} });
    }

    // Add connection to target user's document
    await updateDoc(targetUserRef, {
      [`connections.${currentUser.uid}`]: {
        email: currentUser.email,
        username: currentUserData.username || null,
        connectedAt: serverTimestamp()
      }
    });

    console.log('Connection added successfully');
  } catch (error) {
    console.error('Error in addConnection:', error);
    throw error;
  }
};

/**
 * Fetches all connections for the current user
 * @returns Array of connections with user details
 * @throws Error if user is not authenticated
 */
export const fetchUserConnections = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in to fetch connections');
  }

  const userRef = doc(db, 'users', currentUser.uid);
  const userDoc = await getDoc(userRef);
  const userData = userDoc.data();

  if (!userData || !userData.connections) {
    return [];
  }

  // Convert the connections object to an array with IDs
  return Object.entries(userData.connections as UserConnections).map(([userId, connection]) => ({
    id: userId,
    userId,
    email: connection.email,
    username: connection.username,
    connectedAt: connection.connectedAt
  }));
};

/**
 * Updates the username in the user's document and all their connections
 * @param newUsername The new username to set
 * @throws Error if user is not authenticated
 */
export const updateUsername = async (newUsername: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in to update username');
  }

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (!userData) {
      throw new Error('User data not found');
    }

    // Start a new batch write
    const batch = writeBatch(db);

    // Update the username in the user's own document
    batch.update(userRef, {
      username: newUsername.trim()
    });

    // If the user has connections, update the username in all connected users' documents
    if (userData.connections) {
      const connectedUserIds = Object.keys(userData.connections);
      
      for (const connectedUserId of connectedUserIds) {
        const connectedUserRef = doc(db, 'users', connectedUserId);
        const connectedUserDoc = await getDoc(connectedUserRef);
        
        if (connectedUserDoc.exists()) {
          // Update the username in the connected user's connections
          batch.update(connectedUserRef, {
            [`connections.${currentUser.uid}.username`]: newUsername.trim()
          });
        }
      }
    }

    // Commit all updates in a single batch
    await batch.commit();
    console.log('Username updated successfully in all locations');
  } catch (error) {
    console.error('Error updating username:', error);
    throw error;
  }
};

/**
 * Deletes an activity from Firestore
 * @param activityId The ID of the activity to delete
 * @throws Error if user is not authenticated or not the owner of the activity
 */
export const deleteActivity = async (activityId: string) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in to delete activities');
  }

  try {
    // Get the activity document to verify ownership
    const activityRef = doc(db, 'activities', activityId);
    const activityDoc = await getDoc(activityRef);

    if (!activityDoc.exists()) {
      throw new Error('Activity not found');
    }

    // Verify the current user owns this activity
    if (activityDoc.data().userId !== currentUser.uid) {
      throw new Error('You can only delete your own activities');
    }

    // Delete the activity
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
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in to fetch activities');
  }

  try {
    // First, get the current user's connections
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    if (!userData?.connections) {
      return []; // Return empty array if user has no connections
    }

    // Get the IDs of all connected users
    const connectedUserIds = Object.keys(userData.connections);

    // Query activities created by any of the connected users
    const activitiesRef = collection(db, 'activities');
    const q = query(
      activitiesRef,
      where('userId', 'in', connectedUserIds)
    );

    const querySnapshot = await getDocs(q);

    // Filter and map the activities
    const activities = querySnapshot.docs
      .map(doc => {
        const activityData = doc.data() as Omit<Activity, 'id'>;
        const creatorId = activityData.userId;
        const creatorInfo = userData.connections[creatorId];

        return {
          ...activityData,
          id: doc.id,
          dateTime: new Date(activityData.dateTime),
          createdBy: creatorInfo.username || creatorInfo.email
        } as Activity;
      })
      // Filter out activities where the current user is already a joiner
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
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in to update activities');
  }

  try {
    // Get the activity document to verify ownership
    const activityRef = doc(db, 'activities', activity.id);
    const activityDoc = await getDoc(activityRef);

    if (!activityDoc.exists()) {
      throw new Error('Activity not found');
    }

    // Verify the current user owns this activity
    if (activityDoc.data().userId !== currentUser.uid) {
      throw new Error('You can only update your own activities');
    }

    // Update the activity
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
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in to join activities');
  }

  try {
    // Get user data to include username if available
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

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
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in to leave activities');
  }

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
  const currentUser = auth.currentUser;
  if (!currentUser || !activity.joiners) {
    return false;
  }
  return !!activity.joiners[currentUser.uid];
}; 