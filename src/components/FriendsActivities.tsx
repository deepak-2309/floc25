import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import ActivityCard from './ActivityCard';
import { fetchConnectionsActivities } from '../firebase';

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
      // Sort activities by date, most recent first
      const sortedActivities = fetchedActivities.sort(
        (a, b) => b.dateTime.getTime() - a.dateTime.getTime()
      );
      setActivities(sortedActivities);
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
            showDelete={false}
            creatorName={activity.creatorName}
          />
        ))
      )}
    </Box>
  );
};

export default FriendsActivities; 