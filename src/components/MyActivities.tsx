import React, { useState, useEffect } from 'react';
import { Box, Fab, CircularProgress, Alert, Snackbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ActivityCard, { Activity } from './ActivityCard';
import CreateActivitySheet from './CreateActivitySheet';
import EditActivitySheet from './EditActivitySheet';
import { 
  writeActivity, 
  fetchUserActivities, 
  deleteActivity, 
  updateActivity,
  joinActivity,
  leaveActivity,
  hasUserJoined
} from '../firebase/activityActions';

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
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch activities when component mounts
  useEffect(() => {
    loadActivities();
  }, []);

  // Function to load activities from Firebase
  const loadActivities = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedActivities = await fetchUserActivities();
      
      // Filter out past activities and sort by date (earliest first)
      const now = new Date();
      const filteredAndSortedActivities = fetchedActivities
        .filter(activity => activity.dateTime > now)
        .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
      
      setActivities(filteredAndSortedActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handler for deleting an activity
   * Deletes the activity from Firestore and updates the local state
   */
  const handleDelete = async (id: string) => {
    try {
      await deleteActivity(id);
      // Update local state to remove the deleted activity
      setActivities(activities.filter(activity => activity.id !== id));
      setSuccessMessage('Activity deleted successfully');
    } catch (error) {
      console.error('Error deleting activity:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to delete activity');
      }
    }
  };

  /**
   * Handler for editing an activity
   * Opens the edit sheet with the selected activity
   */
  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setIsEditSheetOpen(true);
  };

  /**
   * Handler for submitting edited activity
   * Updates the activity in Firestore and local state
   */
  const handleSubmitEdit = async (updatedActivity: Activity) => {
    try {
      setError(null);
      await updateActivity(updatedActivity);
      
      // Update local state
      setActivities(activities.map(activity => 
        activity.id === updatedActivity.id ? updatedActivity : activity
      ));
      
      setSuccessMessage('Activity updated successfully');
      setIsEditSheetOpen(false);
      setEditingActivity(null);
    } catch (error) {
      console.error('Error updating activity:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to update activity');
      }
    }
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
      setError(null);
      const newActivityId = await writeActivity(activity);
      console.log('Activity created with ID:', newActivityId);
      
      // Reload activities to include the new one
      await loadActivities();
      setSuccessMessage('Activity created successfully');
    } catch (error) {
      console.error('Error creating activity:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to create activity');
      }
    }
  };

  /**
   * Handler for joining/leaving an activity
   */
  const handleJoinToggle = async (activity: Activity) => {
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

  return (
    <Box sx={{ p: 2, position: 'relative', minHeight: '100vh' }}>
      {/* Error message display */}
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
            onEdit={() => handleEdit(activity)}
            onJoinToggle={() => handleJoinToggle(activity)}
            isJoined={hasUserJoined(activity)}
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

      {/* Bottom sheet for editing activities */}
      {editingActivity && (
        <EditActivitySheet
          open={isEditSheetOpen}
          onClose={() => {
            setIsEditSheetOpen(false);
            setEditingActivity(null);
          }}
          onSubmit={handleSubmitEdit}
          activity={editingActivity}
          onDelete={() => handleDelete(editingActivity.id)}
        />
      )}
    </Box>
  );
};

export default MyActivities; 