import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  CircularProgress, 
  Alert,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { fetchActivityById, joinActivity, hasUserJoined, leaveActivity } from '../firebase/activityActions';
import ActivityCard, { Activity } from './ActivityCard';
import { auth } from '../firebase/config';
import { getCurrentUserData } from '../firebase/authUtils';

// Import routes from App for consistency
const ROUTES = {
  MY_ACTIVITIES: '/my-plans',
};

/**
 * ActivityPage Component
 * 
 * Displays a single activity based on the ID in the URL.
 * This is the page users will see when they follow a shared activity link.
 */
const ActivityPage: React.FC = () => {
  const { activityId } = useParams<{ activityId: string }>();
  // Add debug logging for the activity ID
  console.log('ActivityPage rendered with activityId:', activityId);
  
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [joinLoading, setJoinLoading] = useState<boolean>(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState<boolean>(false);
  const [isConnectedToCreator, setIsConnectedToCreator] = useState<boolean>(false);

  useEffect(() => {
    const loadActivity = async () => {
      if (!activityId) {
        console.error('No activityId found in URL params');
        setError('No activity ID provided');
        setIsLoading(false);
        return;
      }

      // Check if user is authenticated
      if (!auth.currentUser) {
        console.log('User not authenticated, cannot fetch activity');
        setError('Please log in to view this activity');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Attempting to fetch activity with ID:', activityId);
        setIsLoading(true);
        setError(null);
        
        const activityData = await fetchActivityById(activityId);
        console.log('Activity data retrieved:', activityData);
        
        if (!activityData) {
          console.error('Activity not found for ID:', activityId);
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

        // Check if user is connected to creator
        const userData = await getCurrentUserData();
        const isConnected = userData?.connections && userData.connections[activityData.userId];
        setIsConnectedToCreator(isConnected);
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
      
      if (isJoined) {
        await leaveActivity(activity.id);
        setIsJoined(false);
      } else {
        // If not connected to creator, show confirmation dialog
        if (!isConnectedToCreator && activity.userId !== auth.currentUser?.uid) {
          setShowConnectionDialog(true);
          return;
        }
        await joinActivity(activity.id);
        setIsJoined(true);
        navigate(ROUTES.MY_ACTIVITIES);
        return;
      }
      
      // Refresh activity to get updated joiners list (only if not redirecting)
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

  const handleConfirmJoin = async () => {
    if (!activity) return;
    
    try {
      setJoinLoading(true);
      await joinActivity(activity.id, true); // Pass true to establish connection
      setIsJoined(true);
      setShowConnectionDialog(false);
      navigate(ROUTES.MY_ACTIVITIES);
    } catch (error) {
      console.error('Error joining activity:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to join activity');
      }
      setShowConnectionDialog(false);
    } finally {
      setJoinLoading(false);
    }
  };

  // Handle going back to activities list
  const handleBackToActivities = () => {
    navigate(ROUTES.MY_ACTIVITIES);
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
      {/* Use the shared ActivityCard component */}
      <ActivityCard
        activity={activity}
        onJoinToggle={auth.currentUser && auth.currentUser.uid !== activity.userId ? handleJoinToggle : undefined}
        isJoined={isJoined}
      />
      
      {/* Additional actions for shared activities */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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

      {/* Connection Confirmation Dialog */}
      <Dialog
        open={showConnectionDialog}
        onClose={() => setShowConnectionDialog(false)}
      >
        <DialogTitle>Connect with Activity Creator</DialogTitle>
        <DialogContent>
          <Typography>
            By joining this activity, you will be connected with the creator. This means:
          </Typography>
          <Box component="ul" sx={{ mt: 1 }}>
            <li>You'll be able to see their future activities</li>
            <li>They'll be able to see your activities</li>
            <li>You can view your connections on the Profile tab</li>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConnectionDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmJoin} variant="contained" disabled={joinLoading}>
            {joinLoading ? 'Joining...' : 'Join & Connect'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ActivityPage; 