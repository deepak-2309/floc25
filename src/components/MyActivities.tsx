import React, { useState } from 'react';
import type { Activity } from '../types/Activity';
import ActivityCard from './ActivityCard';
import NewActivityModal from './NewActivityModal';

const SAMPLE_ACTIVITIES: Activity[] = [
  {
    id: '1',
    title: 'Sprints',
    datetime: '2024-01-20T05:00:00',
    location: 'Central Park',
    description: 'Morning sprint training',
    createdBy: 'me'
  },
  {
    id: '2',
    title: 'Stand-up Comedy Show',
    datetime: '2024-01-21T20:00:00',
    location: 'Laugh Factory',
    description: 'Open mic night',
    createdBy: 'me'
  },
  {
    id: '3',
    title: 'Yoga Session',
    datetime: '2024-01-22T07:00:00',
    location: 'Home',
    description: 'Morning yoga routine',
    createdBy: 'me'
  }
];

interface MyActivitiesProps {
  isModalOpen: boolean;
  onModalClose: () => void;
}

function MyActivities({ isModalOpen, onModalClose }: MyActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>(SAMPLE_ACTIVITIES);

  const handleNewActivity = (newActivity: Omit<Activity, 'id'>) => {
    const activity: Activity = {
      ...newActivity,
      id: (activities.length + 1).toString() // In a real app, use a proper ID generator
    };
    setActivities(prev => [...prev, activity]);
  };

  return (
    <div className="p-4 pt-0">
      <div className="space-y-4">
        {activities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </div>

      <NewActivityModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        onSubmit={handleNewActivity}
      />
    </div>
  );
}

export default MyActivities; 