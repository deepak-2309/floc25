import React, { useState, useEffect } from 'react';
import type { Activity } from '../types/Activity';
import ActivityCard from './ActivityCard';
import { getFriendsActivities } from '../services/firestore';
import { auth } from '../config/firebase';

function FriendsActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      if (!auth.currentUser) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const fetchedActivities = await getFriendsActivities(auth.currentUser.uid);
        setActivities(fetchedActivities);
      } catch (err) {
        console.error('Error fetching friends activities:', err);
        setError('Failed to load activities. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-instagram-brown border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-instagram-dark/60">Loading friends' activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-0">
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center text-instagram-dark/60 py-8">
            <p>No activities from friends yet.</p>
            <p className="text-sm">Share the app with your friends to see their activities!</p>
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} showCreator />
          ))
        )}
      </div>
    </div>
  );
}

export default FriendsActivities; 