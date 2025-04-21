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
  createdBy: string;   // Name of the user who created the activity
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
  onDelete?: (id: string) => void; // Callback function for delete action (optional)
}

/**
 * ActivityCard Component
 * 
 * A reusable card component that displays activity information in a consistent format.
 * Can be used in both MyActivities and FriendsActivities views with different configurations.
 * 
 * @param activity - The activity data to display
 * @param showDelete - Optional flag to show/hide delete button
 * @param onDelete - Optional callback function when delete is clicked
 */
const ActivityCard: React.FC<ActivityCardProps> = ({ activity, showDelete = false, onDelete }) => {
  // Handler for delete button click
  const handleDelete = () => {
    if (onDelete) {
      onDelete(activity.id);
    }
  };

  // Format the date for display
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Flex container for activity details and delete button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Activity information section */}
          <Box>
            <Typography variant="h6" gutterBottom>
              {activity.name}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {activity.createdBy}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {activity.location}
            </Typography>
            <Typography color="text.secondary">
              {formatDateTime(activity.dateTime)}
            </Typography>
          </Box>
          {/* Conditional render of delete button */}
          {showDelete && (
            <IconButton
              aria-label="Delete activity"
              onClick={handleDelete}
              size="small"
              color="default"
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