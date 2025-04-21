import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp, getDoc, updateDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
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
}) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in to create activities');
  }

  const docRef = await addDoc(collection(db, 'activities'), {
    ...activityData,
    dateTime: activityData.dateTime.toISOString(),
    createdAt: new Date().toISOString(),
    userId: currentUser.uid,
    createdBy: currentUser.email || 'Anonymous'
  });

  return docRef.id;
};

/**
 * Fetches all activities created by the current user
 * @returns Array of activities
 * @throws Error if user is not authenticated
 */
export const fetchUserActivities = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in to fetch activities');
  }

  const activitiesRef = collection(db, 'activities');
  const q = query(activitiesRef, where('userId', '==', currentUser.uid));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    dateTime: new Date(doc.data().dateTime) // Convert ISO string back to Date object
  })) as Activity[];
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