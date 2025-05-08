import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, DocumentData } from 'firebase/firestore';
import { auth, db } from './config'; // Import from config

// --- Helper Functions ---

/**
 * Gets the current authenticated user or throws an error if not logged in.
 * @returns The current Firebase User object.
 * @throws Error if no user is authenticated.
 */
export const getCurrentUserOrThrow = (): User => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be logged in for this operation');
  }
  return currentUser;
};

/**
 * Fetches the Firestore document data for the currently authenticated user.
 * @returns The user data object from Firestore.
 * @throws Error if user is not logged in or user document doesn't exist.
 */
export const getCurrentUserData = async (): Promise<DocumentData> => {
    const currentUser = getCurrentUserOrThrow(); // Use the helper here too
    const userRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        console.error(`User document not found for UID: ${currentUser.uid}`);
        throw new Error('Current user data not found in Firestore.');
    }
    return userDoc.data();
};

/**
 * Extracts a default username from an email address by taking the part before the @ symbol
 * @param email User's email address
 * @returns Default username or null if email is invalid
 */
export const getDefaultUsernameFromEmail = (email: string | null): string | null => {
  if (!email) return null;
  
  const atIndex = email.indexOf('@');
  if (atIndex === -1) return null;
  
  return email.substring(0, atIndex);
};

// Function to update user data in Firestore when a user is created or logs in
export const updateUserData = async (user: {
  uid: string;
  email: string | null;
}) => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Generate default username from email for new users
      const defaultUsername = getDefaultUsernameFromEmail(user.email);
      
      // For new users, set all initial fields including createdAt and default username
      await setDoc(userRef, {
        email: user.email,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        username: defaultUsername // Set default username instead of null
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
    // Consider re-throwing or handling more robustly depending on application needs
  }
}; 