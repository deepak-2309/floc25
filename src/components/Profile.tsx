import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import ConnectionsList from './ConnectionsList';

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

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
        }
      }
      setLoading(false);
    };

    fetchUsername();
  }, []);

  const handleSaveUsername = async () => {
    if (!auth.currentUser) return;

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        username: username.trim()
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating username:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 2 }}>
          {isEditing ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <TextField
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                size="small"
                fullWidth
                autoFocus
              />
              <Button
                variant="contained"
                onClick={handleSaveUsername}
                disabled={!username.trim()}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </Box>
          ) : (
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

        <Typography variant="body1" color="textSecondary">
          {auth.currentUser?.email}
        </Typography>
      </Paper>

      <ConnectionsList />
    </Box>
  );
}

export default Profile; 