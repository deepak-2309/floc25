import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, TextField, Button, Paper, IconButton, Alert, Collapse } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import ConnectionsList from './ConnectionsList';
import UserProfile from './UserProfile';
import { updateUsername } from '../firebase/userActions';
import PastActivities from './PastActivities';
import CollapsibleSection from './CollapsibleSection';

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
  const [connectionsExpanded, setConnectionsExpanded] = useState(false);  // Controls connections card collapse
  const [pastActivitiesExpanded, setPastActivitiesExpanded] = useState(false); // Controls past activities card collapse
  const [connectionsCount, setConnectionsCount] = useState(0);  // Connections count for header
  const [pastActivitiesCount, setPastActivitiesCount] = useState(0); // Past activities count for header
  const [viewingUserId, setViewingUserId] = useState<string | null>(null); // When viewing another user's profile

  // Handler for clicking on a connection's username
  const handleUserClick = useCallback((userId: string) => {
    setViewingUserId(userId);
  }, []);

  // Handler to go back from viewing another user's profile
  const handleBackFromProfile = useCallback(() => {
    setViewingUserId(null);
  }, []);

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

  // If viewing another user's profile, show UserProfile component
  if (viewingUserId) {
    return <UserProfile userId={viewingUserId} onBack={handleBackFromProfile} />;
  }

  return (
    <Box sx={{ p: 2, pb: 12 }}>
      {/* Profile Information Card */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ mb: 2 }}>
          {/* Error Alert - Shows any error messages */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Username Edit Form */}
          {isEditing ? (
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <TextField
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                placeholder="Enter username"
                size="small"
                sx={{ flex: 1, minWidth: 200 }}
                autoFocus
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveUsername}
                  disabled={!username.trim()}
                  size="small"
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                  }}
                  size="small"
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            /* Username Display with Edit Button */
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {username || 'Add Username'}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setIsEditing(true)}
                color="primary"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </Box>

        {/* User Email Display */}
        <Typography variant="body2" color="text.secondary">
          {auth.currentUser?.email}
        </Typography>
      </Paper>

      {/* Connections List Component */}
      <CollapsibleSection title="Connections" count={connectionsCount}>
        <ConnectionsList
          hideHeader
          onCountChange={setConnectionsCount}
          onUserClick={handleUserClick}
        />
      </CollapsibleSection>

      {/* Past Activities Component */}
      <CollapsibleSection title="Past Activities" count={pastActivitiesCount}>
        <PastActivities hideHeader onCountChange={setPastActivitiesCount} />
      </CollapsibleSection>
    </Box >
  );
}

export default Profile; 