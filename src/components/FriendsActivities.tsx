import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';
import ActivityCard from './ActivityCard';
import { 
  fetchConnectionsActivities, 
  joinActivity, 
  leaveActivity, 
  hasUserJoined 
} from '../firebase';

/**
 * FriendsActivities Component
 * 
 * Displays activities created by the user's connections.
 * Activities are shown in chronological order with the creator's name.
 */
const FriendsActivities: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load activities when component mounts
  useEffect(() => {
    loadActivities();
  }, []);

  // Function to load activities from Firebase
  const loadActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedActivities = await fetchConnectionsActivities();
      
      // Filter out past activities and sort by date (earliest first)
      const now = new Date();
      const filteredAndSortedActivities = fetchedActivities
        .filter(activity => activity.dateTime > now)
        .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
      
      setActivities(filteredAndSortedActivities);
    } catch (error) {
      console.error('Error fetching friends activities:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to load activities');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handler for joining/leaving an activity
   */
  const handleJoinToggle = async (activity: any) => {
    try {
      setError(null);
      setSuccessMessage(null); // Clear any existing message
      const isJoined = hasUserJoined(activity);
      
      if (isJoined) {
        await leaveActivity(activity.id);
        setSuccessMessage('Left activity successfully');
      } else {
        await joinActivity(activity.id);
        setSuccessMessage('Joined activity successfully');
      }
      
      // Reload activities to update joiners list
      await loadActivities();
    } catch (error) {
      console.error('Error toggling activity join:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to update activity participation');
      }
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Success message snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={2000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />

      {activities.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="textSecondary">
            No activities from your connections yet.
            {!error && " Add some connections to see their activities here!"}
          </Typography>
        </Box>
      ) : (
        activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onJoinToggle={() => handleJoinToggle(activity)}
            isJoined={hasUserJoined(activity)}
          />
        ))
      )}
    </Box>
  );
};

export default FriendsActivities; 