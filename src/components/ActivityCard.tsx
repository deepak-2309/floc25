import React from 'react';
import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Interface representing an activity in the application.
 * Contains all necessary information about a single activity.
 */
export interface Activity {
  id: string;          // Unique identifier for the activity
  name: string;        // Name/title of the activity
  createdBy?: string;  // Name of the user who created the activity (optional)
  location: string;    // Location where the activity will take place
  dateTime: Date;      // Date and time when the activity is scheduled
}

/**
 * Props interface for the ActivityCard component.
 * Defines the expected properties that can be passed to the component.
 */
interface ActivityCardProps {
  activity: Activity;              // The activity data to display
  showDelete?: boolean;            // Whether to show the delete button (optional)
  onDelete?: () => void;           // Callback function for delete action (optional)
  creatorName?: string;            // Name of the activity creator (optional)
}

/**
 * ActivityCard Component
 * 
 * Displays an activity in a Material-UI Card format.
 * Shows the activity name, location, date/time, and optionally a delete button.
 * When used in FriendsActivities, it also shows the creator's name.
 */
const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  showDelete = false,
  onDelete,
  creatorName
}) => {
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
            <Typography variant="body2">
              {formatDateTime(activity.dateTime)}
            </Typography>
          </Box>
          {showDelete && onDelete && (
            <IconButton
              aria-label="delete"
              onClick={onDelete}
              sx={{ mt: -1, mr: -1 }}
            >
              <DeleteIcon />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActivityCard; 