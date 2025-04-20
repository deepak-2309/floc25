import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import type { Activity } from '../types/Activity';
import ActivityCard from './ActivityCard';
import NewActivityModal from './NewActivityModal';
import { getUserName } from '../services/firestore';

interface MyActivitiesProps {
  isModalOpen: boolean;
  onModalClose: () => void;
}

function MyActivities({ isModalOpen, onModalClose }: MyActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      loadActivities();
      loadUserName();
    }
  }, [user]);

  const loadUserName = async () => {
    if (!user) return;
    const name = await getUserName(user.uid);
    setUserName(name);
  };

  const loadActivities = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      const q = query(
        collection(db, 'activities'),
        where('userId', '==', user.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const activitiesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdBy: userName || user.uid
      })) as Activity[];

      setActivities(activitiesList.sort((a, b) => 
        new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
      ));
    } catch (err) {
      console.error('Error loading activities:', err);
      setError('Failed to load activities');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddActivity = async (activityData: Omit<Activity, 'id' | 'createdBy' | 'userId'>) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'activities'), {
        ...activityData,
        userId: user.uid,
        userEmail: user.email,
        createdBy: userName || user.uid
      });

      loadActivities();
      onModalClose();
    } catch (error) {
      console.error('Error adding activity:', error);
      setError('Failed to add activity');
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteDoc(doc(db, 'activities', activityId));
      loadActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      setError('Failed to delete activity');
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-instagram-brown border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-instagram-dark/60">Loading your activities...</p>
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
            <p>No activities yet.</p>
            <p className="text-sm">Click the + button to add your first activity!</p>
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onDelete={handleDeleteActivity}
            />
          ))
        )}
      </div>

      <NewActivityModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        onSubmit={handleAddActivity}
      />
    </div>
  );
}

export default MyActivities; 