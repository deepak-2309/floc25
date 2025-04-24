import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, IconButton, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import ConnectionsList from './ConnectionsList';
import { updateUsername } from '../firebase/userActions';

/**
 * Profile Component
 * 
 * This component displays and manages a user's profile information, including:
 * - Username (editable)
 * - Email (read-only, from Firebase auth)
 * - List of connections (managed by ConnectionsList component)
 * 
 * The component allows users to:
 * 1. View their current username and email
 * 2. Edit their username
 * 3. View their connections
 */
function Profile() {
  // State Management
  const [isEditing, setIsEditing] = useState(false);        // Controls username edit mode
  const [username, setUsername] = useState('');             // Stores current username
  const [loading, setLoading] = useState(true);            // Tracks initial data loading
  const [error, setError] = useState<string | null>(null); // Stores error messages

  /**
   * Effect Hook: Fetch Username
   * 
   * Runs when component mounts to fetch the user's username from Firestore.
   * Updates the username state if one exists in the database.
   */
  useEffect(() => {
    const fetchUsername = async () => {
      if (auth.currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists() && userDoc.data().username) {
            setUsername(userDoc.data().username);
          }
        } catch (error) {
          console.error('Error fetching username:', error);
          setError('Failed to load username');
        }
      }
      setLoading(false);
    };

    fetchUsername();
  }, []);

  /**
   * Handler: Save Username
   * 
   * Saves the updated username to Firestore and updates all connections.
   * Uses the updateUsername function from firebase.ts which:
   * 1. Updates the user's own document
   * 2. Updates the username in all connected users' documents
   * 3. Handles all updates in a single batch write
   */
  const handleSaveUsername = async () => {
    if (!auth.currentUser) return;

    try {
      setError(null);
      await updateUsername(username);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating username:', error);
      setError('Failed to update username');
    }
  };

  // Show loading state while fetching initial data
  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Profile Information Card */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          {/* Error Alert - Shows any error messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {/* Username Edit Form */}
          {isEditing ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null); // Clear any previous errors
                }}
                placeholder="Enter username"
                size="small"
                fullWidth
                autoFocus
              />
              <Button
                variant="contained"
                onClick={handleSaveUsername}
                disabled={!username.trim()} // Disable if username is empty
              >
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            /* Username Display with Edit Button */
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="h6">
                {username || 'Add Username'}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setIsEditing(true)}
                sx={{ ml: 1 }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* User Email Display */}
        <Typography variant="body1" color="textSecondary">
          {auth.currentUser?.email}
        </Typography>
      </Paper>

      {/* Connections List Component */}
      <ConnectionsList />
    </Box>
  );
}

export default Profile; 