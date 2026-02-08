import React, { useState } from 'react';
import { Box, Fab, CircularProgress, Alert, Snackbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ActivityCard, CreateActivitySheet, EditActivitySheet } from '../activities';
import { Activity } from '../../types';
import {
  writeActivity,
  deleteActivity,
  updateActivity,
} from '../../firebase/activityActions';
import { useActivities } from '../../hooks/useActivities';

/**
 * MyActivities Component
 * 
 * Displays a list of activities created by the current user.
 * Uses useActivities hook for data fetching and state management.
 */
const MyActivities: React.FC = () => {
  // Use the custom hook for activity management
  const {
    activities,
    isLoading,
    error: hookError,
    reload,
    joinToggle,
    isJoined
  } = useActivities({
    source: 'user',
    filterPast: true,
    sortAscending: true
  });

  // Local state for UI management (sheets, snackbars)
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Combine errors from hook and local actions
  const displayError = hookError || actionError;

  const handleCreateActivity = () => {
    setIsCreateSheetOpen(true);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setIsEditSheetOpen(true);
  };

  const handleSubmitActivity = async (activity: Omit<Activity, 'id'>) => {
    try {
      setActionError(null);
      await writeActivity(activity);
      await reload(); // Reload list after creation
      setSuccessMessage('Activity created successfully');
    } catch (error: any) {
      console.error('Error creating activity:', error);
      setActionError(error.message || 'Failed to create activity');
    }
  };

  const handleSubmitEdit = async (updatedActivity: Activity) => {
    try {
      setActionError(null);
      await updateActivity(updatedActivity);
      await reload(); // Reload list after update
      setSuccessMessage('Activity updated successfully');
      setIsEditSheetOpen(false);
      setEditingActivity(null);
    } catch (error: any) {
      console.error('Error updating activity:', error);
      setActionError(error.message || 'Failed to update activity');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionError(null);
      await deleteActivity(id);
      await reload(); // Reload list after deletion
      setSuccessMessage('Activity deleted successfully');
    } catch (error: any) {
      console.error('Error deleting activity:', error);
      setActionError(error.message || 'Failed to delete activity');
    }
  };

  const handleJoinToggle = async (activity: Activity) => {
    await joinToggle(activity);
  };

  return (
    <Box sx={{ p: 2, position: 'relative' }}>
      {/* Error message display */}
      {displayError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {displayError}
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
        activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onEdit={() => handleEdit(activity)}
            onJoinToggle={() => handleJoinToggle(activity)}
            isJoined={isJoined(activity)}
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