import { collection, doc, getDoc, getDocs, query, serverTimestamp, updateDoc, where, writeBatch, deleteField } from 'firebase/firestore';
import { db } from './config'; // Import from config
import { getCurrentUserData, getCurrentUserOrThrow } from './authUtils'; // Import helpers

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
  const currentUser = getCurrentUserOrThrow();
  const currentUserData = await getCurrentUserData();

  if (targetEmail === currentUser.email) {
    throw new Error('Cannot connect with yourself');
  }

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', targetEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error('User not found');
    }

    const targetUserDoc = querySnapshot.docs[0];
    const targetUserData = targetUserDoc.data();
    const currentUserRef = doc(db, 'users', currentUser.uid);

    if (currentUserData.connections && currentUserData.connections[targetUserDoc.id]) {
      throw new Error('Connection already exists');
    }

    if (!currentUserData.connections) {
      await updateDoc(currentUserRef, { connections: {} });
    }

    await updateDoc(currentUserRef, {
      [`connections.${targetUserDoc.id}`]: {
        email: targetUserData.email,
        username: targetUserData.username || null,
        connectedAt: serverTimestamp()
      }
    });

    const targetUserRef = doc(db, 'users', targetUserDoc.id);
    const targetUserCurrentData = (await getDoc(targetUserRef)).data() || {};
    if (!targetUserCurrentData.connections) {
      await updateDoc(targetUserRef, { connections: {} });
    }

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
  const userData = await getCurrentUserData();

  if (!userData || !userData.connections) {
    return [];
  }

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
  const currentUser = getCurrentUserOrThrow();
  const userData = await getCurrentUserData();

  try {
    const userRef = doc(db, 'users', currentUser.uid);
    const batch = writeBatch(db);

    batch.update(userRef, {
      username: newUsername.trim()
    });

    if (userData.connections) {
      const connectedUserIds = Object.keys(userData.connections);
      for (const connectedUserId of connectedUserIds) {
        const connectedUserRef = doc(db, 'users', connectedUserId);
        const connectedUserDoc = await getDoc(connectedUserRef);
        if (connectedUserDoc.exists()) {
          batch.update(connectedUserRef, {
            [`connections.${currentUser.uid}.username`]: newUsername.trim()
          });
        }
      }
    }

    await batch.commit();
    console.log('Username updated successfully in all locations');
  } catch (error) {
    console.error('Error updating username:', error);
    throw error;
  }
};

/**
 * Removes a connection between the current user and the specified user
 * @param targetUserId The ID of the user to remove from connections
 * @throws Error if user is not authenticated or connection doesn't exist
 */
export const removeConnection = async (targetUserId: string) => {
  const currentUser = getCurrentUserOrThrow();
  const currentUserData = await getCurrentUserData();

  try {
    if (!currentUserData.connections || !currentUserData.connections[targetUserId]) {
      throw new Error('Connection does not exist');
    }

    const currentUserRef = doc(db, 'users', currentUser.uid);
    const targetUserRef = doc(db, 'users', targetUserId);
    const batch = writeBatch(db);

    // Remove connection from current user's document
    batch.update(currentUserRef, {
      [`connections.${targetUserId}`]: deleteField()
    });

    // Remove connection from target user's document
    batch.update(targetUserRef, {
      [`connections.${currentUser.uid}`]: deleteField()
    });

    await batch.commit();
    console.log('Connection removed successfully');
  } catch (error) {
    console.error('Error removing connection:', error);
    throw error;
  }
}; 