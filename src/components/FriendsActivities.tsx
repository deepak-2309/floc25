import React from 'react';
import { Box } from '@mui/material';
import ActivityCard, { Activity } from './ActivityCard';

/**
 * Sample activity data for demonstration purposes.
 * In a real application, this would be fetched from a backend service
 * to show activities created by the user's friends.
 */
const sampleActivities: Activity[] = [
  {
    id: '1',
    name: 'Evening Jog',
    createdBy: 'John',
    location: 'City Park',
    dateTime: new Date('2024-03-23T17:00:00') // Saturday, 5:00 PM
  }
];

/**
 * FriendsActivities Component
 * 
 * Displays a list of activities created by the user's friends.
 * Each activity is displayed in a card format without delete options
 * since users can't delete their friends' activities.
 * This component uses the ActivityCard component to render each activity.
 */
const FriendsActivities: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      {/* Map through friends' activities and render an ActivityCard for each */}
      {sampleActivities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          showDelete={false}
        />
      ))}
    </Box>
  );
};

export default FriendsActivities; 