import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { ActivityCard } from '../activities';
import { useActivities } from '../../hooks';
import { Activity } from '../../types';
import { auth } from '../../firebase/config';

/**
 * FriendsActivities Component
 * 
 * Displays activities created by the user's connections.
 * Activities are shown in chronological order with the creator's name.
 */
const FriendsActivities: React.FC = () => {
  const {
    activities,
    isLoading,
    error,
    successMessage,
    joinToggle,
    isJoined,
    clearSuccessMessage,
  } = useActivities({ source: 'connections' });

  const [leaveConfirm, setLeaveConfirm] = useState<{ open: boolean; activity: Activity | null }>({ open: false, activity: null });

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
        onClose={clearSuccessMessage}
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
            isJoined={isJoined(activity)}
          />
        ))
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

export default FriendsActivities;