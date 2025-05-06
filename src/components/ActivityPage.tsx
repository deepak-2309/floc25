import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Alert,
  Snackbar,
  Paper,
  Typography,
} from '@mui/material';
import { fetchActivityById, joinActivity, hasUserJoined, leaveActivity } from '../firebase/activityActions';
import ActivityCard, { Activity } from './ActivityCard';
import { auth } from '../firebase/config';

/**
 * ActivityPage Component
 * 
 * Displays a single activity based on the ID in the URL.
 * This is the page users will see when they follow a shared activity link.
 */
const ActivityPage: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [joinLoading, setJoinLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadActivity = async () => {
      if (!activityId) {
        setError('No activity ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const activityData = await fetchActivityById(activityId);
        
        if (!activityData) {
          setError('Activity not found');
          setIsLoading(false);
          return;
        }
        
        setActivity(activityData);
        
        // Check if current user has joined this activity
        if (activityData.joiners) {
          const joined = await hasUserJoined(activityData);
          setIsJoined(joined);
        }
      } catch (error) {
        console.error('Error loading activity:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to load activity');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadActivity();
  }, [activityId]);

  // Handle joining or leaving the activity
  const handleJoinToggle = async () => {
    if (!activity) return;
    
    try {
      setJoinLoading(true);
      setSuccessMessage(null);
      
      if (isJoined) {
        await leaveActivity(activity.id);
        setIsJoined(false);
        setSuccessMessage('You have left the activity');
      } else {
        await joinActivity(activity.id);
        setIsJoined(true);
        setSuccessMessage('You have joined the activity');
      }
      
      // Refresh activity to get updated joiners list
      const updatedActivity = await fetchActivityById(activity.id);
      if (updatedActivity) {
        setActivity(updatedActivity);
      }
    } catch (error) {
      console.error('Error toggling join status:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to update join status');
      }
    } finally {
      setJoinLoading(false);
    }
  };

  // Handle going back to activities list
  const handleBackToActivities = () => {
    navigate('/my-plans');
  };

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error message if something went wrong
  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={handleBackToActivities}>
          Back to Activities
        </Button>
      </Box>
    );
  }

  // Show not found message if activity doesn't exist
  if (!activity) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Activity not found or you don't have permission to view it.
        </Alert>
        <Button variant="contained" onClick={handleBackToActivities}>
          Back to Activities
        </Button>
      </Box>
    );
  }

  // Determine if user is the creator
  const isCreator = auth.currentUser?.uid === activity.userId;
  
  return (
    <Box sx={{ p: 2 }}>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={2000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />
      
      {/* Use the shared ActivityCard component */}
      <ActivityCard
        activity={activity}
        onJoinToggle={auth.currentUser && auth.currentUser.uid !== activity.userId ? handleJoinToggle : undefined}
        isJoined={isJoined}
      />
      
      {/* Additional actions for shared activities */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!isCreator && (
          <Button
            variant={isJoined ? "outlined" : "contained"}
            color="primary"
            onClick={handleJoinToggle}
            disabled={joinLoading}
            fullWidth
          >
            {joinLoading ? 
              <CircularProgress size={24} color="inherit" /> : 
              (isJoined ? "Leave Activity" : "Join Activity")
            }
          </Button>
        )}
        
        <Button 
          variant="outlined"
          onClick={handleBackToActivities}
          fullWidth
        >
          Back to Activities
        </Button>
      </Box>
      
      {/* Context information for shared activities */}
      <Paper elevation={1} sx={{ p: 2, mt: 2, borderRadius: 2 }}>
        <Typography variant="body2" color="text.secondary">
          This activity has been shared with you. 
          {activity.isPrivate ? 
            " Even though it's marked as private, you can view it because you have the direct link." : 
            " Feel free to join if you're interested!"}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ActivityPage; 