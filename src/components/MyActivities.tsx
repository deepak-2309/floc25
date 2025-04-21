import React, { useState, useEffect } from 'react';
import { Box, Fab, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ActivityCard, { Activity } from './ActivityCard';
import CreateActivitySheet from './CreateActivitySheet';
import { writeActivity, fetchUserActivities } from '../firebase';

/**
 * MyActivities Component
 * 
 * Displays a list of activities created by the current user.
 * Each activity is displayed in a card format with a delete option.
 * This component uses the ActivityCard component to render each activity.
 */
const MyActivities: React.FC = () => {
  // State for managing the bottom sheet visibility and activities
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch activities when component mounts
  useEffect(() => {
    loadActivities();
  }, []);

  // Function to load activities from Firebase
  const loadActivities = async () => {
    try {
      setIsLoading(true);
      const fetchedActivities = await fetchUserActivities();
      setActivities(fetchedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handler for deleting an activity
   * Currently just logs to console, but in a real application
   * this would make an API call to delete the activity
   */
  const handleDelete = (id: string) => {
    // TODO: Implement delete functionality
    console.log('Delete activity:', id);
  };

  /**
   * Handler for creating a new activity
   * Opens the bottom sheet for activity creation
   */
  const handleCreateActivity = () => {
    setIsCreateSheetOpen(true);
  };

  /**
   * Handler for submitting a new activity
   * Uses Firebase service to store the new activity
   */
  const handleSubmitActivity = async (activity: Omit<Activity, 'id'>) => {
    try {
      const newActivityId = await writeActivity(activity);
      console.log('Activity created with ID:', newActivityId);
      
      // Reload activities to include the new one
      await loadActivities();
    } catch (error) {
      console.error('Error creating activity:', error);
      // TODO: Show error message to user
    }
  };

  return (
    <Box sx={{ p: 2, position: 'relative', minHeight: '100vh' }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        // Map through activities and render an ActivityCard for each
        activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            showDelete={true}
            onDelete={handleDelete}
          />
        ))
      )}
      
      {/* Floating Action Button for creating new activities */}
      <Fab
        color="primary"
        aria-label="add activity"
        onClick={handleCreateActivity}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16
        }}
      >
        <AddIcon />
      </Fab>

      {/* Bottom sheet for creating new activities */}
      <CreateActivitySheet
        open={isCreateSheetOpen}
        onClose={() => setIsCreateSheetOpen(false)}
        onSubmit={handleSubmitActivity}
      />
    </Box>
  );
};

export default MyActivities; 