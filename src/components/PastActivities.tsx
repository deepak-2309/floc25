import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import PastActivityCard from './PastActivityCard';
import { fetchPastActivities } from '../firebase/activityActions';
import { Activity } from './ActivityCard';

/**
 * PastActivities Component
 * 
 * Displays a list of past activities (activities with dates before the current date)
 * that the user has either created or joined. Activities are displayed in a compact
 * card format with expandable details.
 * 
 * Features:
 * - Shows activity count in the header
 * - Displays activities in chronological order (most recent first)
 * - Each activity is shown in a compact card that can be expanded
 * - Loading state with spinner
 * - Error handling with alert messages
 */
const PastActivities: React.FC = () => {
  // State Management
  const [activities, setActivities] = useState<Activity[]>([]); // Stores the list of past activities
  const [isLoading, setIsLoading] = useState(true);            // Controls loading state
  const [error, setError] = useState<string | null>(null);     // Stores error messages

  // Load activities when component mounts
  useEffect(() => {
    loadActivities();
  }, []);

  /**
   * Fetches past activities from Firebase
   * Updates the activities state and handles loading/error states
   */
  const loadActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedActivities = await fetchPastActivities();
      setActivities(fetchedActivities);
    } catch (error) {
      console.error('Error fetching past activities:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to load past activities');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while fetching activities
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Error Alert - Shows any error messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Section Header with Activity Count */}
      <Typography variant="h6" gutterBottom>
        Past Activities ({activities.length})
      </Typography>

      {/* Conditional Content Rendering */}
      {activities.length === 0 ? (
        // Empty State Message
        <Typography color="textSecondary" align="center">
          No past activities to show
        </Typography>
      ) : (
        // List of Past Activities
        <Box sx={{ mt: 2 }}>
          {activities.map((activity) => (
            <PastActivityCard key={activity.id} activity={activity} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PastActivities; 