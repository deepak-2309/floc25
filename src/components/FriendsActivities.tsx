import React, { useState } from 'react';
import type { Activity } from '../types/Activity';
import ActivityCard from './ActivityCard';

const SAMPLE_FRIENDS_ACTIVITIES: Activity[] = [
  {
    id: '4',
    title: 'Basketball Game',
    datetime: '2024-01-20T18:00:00',
    location: 'Community Center',
    description: 'Pickup basketball game',
    createdBy: 'John'
  },
  {
    id: '5',
    title: 'Book Club Meeting',
    datetime: '2024-01-21T19:00:00',
    location: 'City Library',
    description: 'Discussing "The Midnight Library"',
    createdBy: 'Sarah'
  },
  {
    id: '6',
    title: 'Hiking Trip',
    datetime: '2024-01-22T09:00:00',
    location: 'Mountain Trail',
    description: 'Easy to moderate difficulty, 2-hour hike',
    createdBy: 'Mike'
  }
];

function FriendsActivities() {
  const [activities] = useState<Activity[]>(SAMPLE_FRIENDS_ACTIVITIES);

  return (
    <div className="p-4 pt-0">
      <div className="space-y-4">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} showCreator />
        ))}
      </div>
    </div>
  );
}

export default FriendsActivities; 