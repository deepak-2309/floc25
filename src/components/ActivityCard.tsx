import React from 'react';
import { Card, CardContent, Typography, IconButton, Box, Button, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import { auth } from '../firebase';

/**
 * Interface representing an activity in the application.
 * Contains all necessary information about a single activity.
 */
export interface Activity {
  id: string;          // Unique identifier for the activity
  name: string;        // Name/title of the activity
  createdBy?: string;  // Name of the user who created the activity (optional)
  userId: string;      // ID of the user who created the activity
  location: string;    // Location where the activity will take place
  dateTime: Date;      // Date and time when the activity is scheduled
  description: string; // Description of the activity
  joiners?: {          // Map of users who have joined the activity
    [userId: string]: {
      email: string;
      username?: string;
      joinedAt: Date;
    }
  };
}

/**
 * Props interface for the ActivityCard component.
 * Defines the expected properties that can be passed to the component.
 */
interface ActivityCardProps {
  activity: Activity;              // The activity data to display
  onEdit?: () => void;            // Callback function for edit action (optional)
  onJoinToggle?: () => void;      // Callback function for join/unjoin action (optional)
  isJoined?: boolean;             // Whether the current user has joined this activity
  creatorName?: string;            // Name of the activity creator (optional)
}

/**
 * ActivityCard Component
 * 
 * Displays an activity in a Material-UI Card format.
 * Shows the activity name, location, date/time.
 * When used in FriendsActivities, it also shows the creator's name.
 */
const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onEdit,
  onJoinToggle,
  isJoined = false,
  creatorName
}) => {
  // Check if current user is the creator of the activity
  const isCreator = auth.currentUser?.uid === activity.userId;

  // Format date and time using native JavaScript
  const formatDateTime = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} at ${timeStr}`;
  };

  // Get number of joiners and format joiner names
  const joinersCount = activity.joiners ? Object.keys(activity.joiners).length : 0;
  const joinersList = activity.joiners 
    ? Object.values(activity.joiners)
      .map(joiner => joiner.username || joiner.email)
      .join(', ')
    : '';

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="div">
              {activity.name}
            </Typography>
            {creatorName && (
              <Typography color="textSecondary" gutterBottom>
                Created by {creatorName}
              </Typography>
            )}
            <Typography color="textSecondary" gutterBottom>
              {activity.location}
            </Typography>
            <Typography variant="body2" gutterBottom>
              {formatDateTime(activity.dateTime)}
            </Typography>
            {activity.description && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {activity.description}
              </Typography>
            )}
          </Box>
          {onEdit && isCreator && (
            <IconButton
              aria-label="edit"
              onClick={onEdit}
              sx={{ mt: -1, mr: -1 }}
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
        
        {/* Join button and joiners count */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 2 }}>
          <Tooltip title={joinersList} placement="top">
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2, cursor: 'pointer' }}>
              <GroupIcon sx={{ mr: 0.5 }} />
              <Typography variant="body2">
                {joinersCount}
              </Typography>
            </Box>
          </Tooltip>
          {onJoinToggle && !isCreator && (
            <Button
              variant={isJoined ? "outlined" : "contained"}
              onClick={onJoinToggle}
              size="small"
            >
              {isJoined ? 'Leave' : 'Join'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivityCard; 