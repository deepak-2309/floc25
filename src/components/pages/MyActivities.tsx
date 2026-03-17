import React, { useState } from 'react';
import { Box, Fab, CircularProgress, Alert, Snackbar, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { ActivityCard, CreateActivitySheet, EditActivitySheet } from '../activities';
import { Activity } from '../../types';
import {
  writeActivity,
  deleteActivity,
  updateActivity,
  cancelActivity,
} from '../../firebase/activityActions';
import { useActivities } from '../../hooks/useActivities';
import { auth, functions } from '../../firebase/config';
import { httpsCallable } from 'firebase/functions';

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
  const [leaveConfirm, setLeaveConfirm] = useState<{ open: boolean; activity: Activity | null }>({ open: false, activity: null });

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

  const handleCancel = async (id: string) => {
    try {
      setActionError(null);
      const activity = editingActivity;
      const hasPaidParticipants =
        activity?.isPaid &&
        Object.entries(activity?.joiners || {}).some(
          ([uid, j]) => uid !== activity.userId && (j.paidAmount || 0) > 0
        );

      if (hasPaidParticipants) {
        // Cloud Function handles refunds + soft-cancel atomically
        const cancelAndRefund = httpsCallable<{ activityId: string }, { success: boolean }>(
          functions,
          'cancelActivityAndRefund'
        );
        await cancelAndRefund({ activityId: id });
      } else {
        await cancelActivity(id);
      }

      await reload();
      setSuccessMessage('Activity cancelled');
      setIsEditSheetOpen(false);
      setEditingActivity(null);
    } catch (error: any) {
      console.error('Error cancelling activity:', error);
      setActionError(error.message || 'Failed to cancel activity');
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

  const handleJoinToggle = (activity: Activity) => {
    const currentUserId = auth.currentUser?.uid;
    const joiner = currentUserId ? activity.joiners?.[currentUserId] : null;
    const isCurrentlyJoined = !!joiner;
    const hasPaid = isCurrentlyJoined && activity.isPaid && (joiner?.paidAmount || 0) > 0;

    if (isCurrentlyJoined && hasPaid) {
      setLeaveConfirm({ open: true, activity });
    } else {
      joinToggle(activity);
    }
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
          onCancel={() => handleCancel(editingActivity.id)}
          onRefresh={reload}
        />
      )}
      <Dialog open={leaveConfirm.open} onClose={() => setLeaveConfirm({ open: false, activity: null })}>
        <DialogTitle>Leave this activity?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You've paid ₹{Math.round((leaveConfirm.activity?.joiners?.[auth.currentUser?.uid || '']?.paidAmount || 0) / 100)}.
            Refunds are at the creator's discretion — they'll need to manually approve your refund.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveConfirm({ open: false, activity: null })}>Stay</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (leaveConfirm.activity) joinToggle(leaveConfirm.activity);
              setLeaveConfirm({ open: false, activity: null });
            }}
          >
            Leave anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyActivities;