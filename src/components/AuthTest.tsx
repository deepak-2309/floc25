import React, { useState } from 'react';
import { auth } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

function AuthTest() {
  const [user, setUser] = useState(auth.currentUser);

  // Listen for auth state changes
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="p-4">
      {user ? (
        <div className="space-y-4">
          <p className="text-instagram-brown">Welcome, {user.email}</p>
          <button
            onClick={handleSignOut}
            className="bg-instagram-brown text-instagram-cream px-4 py-2 rounded-md"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={signInWithGoogle}
          className="bg-instagram-brown text-instagram-cream px-4 py-2 rounded-md"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}

export default AuthTest; 