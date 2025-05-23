import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box, Button, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import { auth } from '../firebase/config';

/**
 * Interface representing an activity in the application.
 * Contains all necessary information about a single activity.
 */
export interface Activity {
  id: string;          // Unique identifier for the activity
  name: string;        // Name/title of the activity
  createdBy: string;   // Name of the user who created the activity
  userId: string;      // ID of the user who created the activity
  location: string;    // Location where the activity will take place
  dateTime: Date;      // Date and time when the activity is scheduled
  description: string; // Description of the activity
  allowJoin?: boolean; // Whether the current user is allowed to join this activity
  isPrivate?: boolean; // Whether the activity is marked as private (not visible to connections)
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
}

/**
 * ActivityCard Component
 * 
 * Displays an activity in a Material-UI Card format with the following layout:
 * - Header: Activity name with optional edit button for creators
 * - Body: Location, date/time, and optional description
 * - Footer: Creator name, joiners count, and join/leave button
 */
const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onEdit,
  onJoinToggle,
  isJoined = false,
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

  // Get number of joiners and format joiner names for tooltip
  const joinersCount = activity.joiners ? Object.keys(activity.joiners).length : 0;
  const joinersList = activity.joiners 
    ? Object.values(activity.joiners)
      .map(joiner => joiner.username || joiner.email)
      .join(', ')
    : '';

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleTooltipToggle = () => {
    setTooltipOpen(!tooltipOpen);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Header section with activity name and action buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              {activity.name}
              {activity.isPrivate && (
                <LockIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
              )}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {activity.location}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {formatDateTime(activity.dateTime)}
            </Typography>
            {activity.description && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                {activity.description}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {onJoinToggle && !isCreator && activity.allowJoin !== false && (
              <Button
                variant={isJoined ? "outlined" : "contained"}
                onClick={onJoinToggle}
                size="small"
                sx={{ mr: 1 }}
              >
                {isJoined ? 'Leave' : 'Join'}
              </Button>
            )}
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
        </Box>
        
        {/* Footer section with creator name and joiners count */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography color="textSecondary" variant="body2">
            by {activity.createdBy}
          </Typography>
          <Tooltip title={joinersList} placement="top" open={tooltipOpen} onClose={() => setTooltipOpen(false)}>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleTooltipToggle}>
              <GroupIcon sx={{ mr: 0.5 }} />
              <Typography variant="body2">
                {joinersCount}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivityCard; 