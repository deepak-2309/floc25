import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

interface Connection {
  id: string;
  email: string;
}

const Profile = () => {
  const [newConnection, setNewConnection] = useState('');
  const [connections, setConnections] = useState<Connection[]>([]);
  const [error, setError] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      loadConnections();
    }
  }, [user]);

  const loadConnections = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, 'connections'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const connectionsList: Connection[] = [];
      querySnapshot.forEach((doc) => {
        connectionsList.push({ id: doc.id, ...doc.data() } as Connection);
      });
      
      setConnections(connectionsList);
    } catch (error) {
      console.error('Error loading connections:', error);
      setError('Failed to load connections');
    }
  };

  const addConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newConnection)) {
        setError('Please enter a valid email address');
        return;
      }

      // Don't allow adding yourself
      if (newConnection === user.email) {
        setError('You cannot add yourself as a connection');
        return;
      }

      // Check if connection already exists
      const existingConnectionQuery = query(
        collection(db, 'connections'),
        where('userId', '==', user.uid),
        where('email', '==', newConnection)
      );
      
      const existingConnections = await getDocs(existingConnectionQuery);
      if (!existingConnections.empty) {
        setError('This connection already exists');
        return;
      }

      await addDoc(collection(db, 'connections'), {
        userId: user.uid,
        email: newConnection,
        createdAt: new Date().toISOString()
      });

      setNewConnection('');
      loadConnections();
      setError('');
    } catch (error) {
      console.error('Error adding connection:', error);
      // Show more detailed error message
      setError(error instanceof Error ? error.message : 'Failed to add connection. Please try again.');
    }
  };

  const removeConnection = async (connectionId: string) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'connections', connectionId));
      loadConnections();
    } catch (error) {
      console.error('Error removing connection:', error);
      setError('Failed to remove connection');
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-instagram-light p-4 rounded-lg shadow">
        <h3 className="text-xl font-serif mb-2 text-instagram-brown">My Profile</h3>
        <div className="space-y-2">
          <p className="text-instagram-dark">
            <span className="font-medium">Email:</span> {user?.email}
          </p>
        </div>
      </div>

      <div className="bg-instagram-light p-4 rounded-lg shadow">
        <h3 className="text-xl font-serif mb-4 text-instagram-brown">My Connections</h3>
        
        <form onSubmit={addConnection} className="mb-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={newConnection}
              onChange={(e) => setNewConnection(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 p-2 border border-instagram-brown/20 rounded focus:outline-none focus:border-instagram-brown"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-instagram-brown text-instagram-cream rounded hover:bg-instagram-dark transition-colors"
            >
              Add
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </form>

        <div className="space-y-2">
          {connections.map((connection) => (
            <div
              key={connection.id}
              className="flex justify-between items-center p-2 bg-instagram-cream rounded"
            >
              <span>{connection.email}</span>
              <button
                onClick={() => removeConnection(connection.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          {connections.length === 0 && (
            <p className="text-instagram-dark/60 text-center py-2">
              No connections yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 