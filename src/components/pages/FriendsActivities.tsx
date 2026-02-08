import React from 'react';
import { Box, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';
import { ActivityCard } from '../activities';
import { useActivities } from '../../hooks';

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
            onJoinToggle={() => joinToggle(activity)}
            isJoined={isJoined(activity)}
          />
        ))
      )}
    </Box>
  );
};

export default FriendsActivities;