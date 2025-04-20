import React, { useState, useEffect } from 'react';
import type { Activity } from '../types/Activity';
import ActivityCard from './ActivityCard';
import NewActivityModal from './NewActivityModal';
import { getMyActivities } from '../services/firestore';
import { auth } from '../config/firebase';

interface MyActivitiesProps {
  isModalOpen: boolean;
  onModalClose: () => void;
}

function MyActivities({ isModalOpen, onModalClose }: MyActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchActivities = async () => {
    if (!auth.currentUser) {
      setError('Please sign in to view your activities.');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      console.log('Starting to fetch activities for user:', auth.currentUser.uid);
      const fetchedActivities = await getMyActivities(auth.currentUser.uid);
      console.log('Successfully fetched activities:', fetchedActivities);
      setActivities(fetchedActivities);
    } catch (err) {
      console.error('Detailed error in MyActivities:', {
        error: err,
        type: err instanceof Error ? err.constructor.name : typeof err,
        message: err instanceof Error ? err.message : String(err)
      });
      
      let errorMessage = 'Failed to load activities. Please try again later.';
      
      if (err instanceof Error) {
        const message = err.message;
        if (message.startsWith('permission-denied:')) {
          errorMessage = message.substring('permission-denied:'.length).trim();
        } else if (message.startsWith('network:')) {
          errorMessage = message.substring('network:'.length).trim();
        } else if (message.startsWith('not-found:')) {
          errorMessage = message.substring('not-found:'.length).trim();
        } else if (message.startsWith('auth:')) {
          errorMessage = message.substring('auth:'.length).trim();
        } else if (message.startsWith('firestore:')) {
          errorMessage = message.substring('firestore:'.length).trim();
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [retryCount]);

  const handleNewActivity = (newActivity: Activity) => {
    setActivities(prev => [newActivity, ...prev]);
  };

  const handleRetry = () => {
    console.log('Retrying fetch activities...');
    setRetryCount(prev => prev + 1);
  };

  const handleDelete = (activityId: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== activityId));
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-instagram-brown border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-instagram-dark/60">
          {retryCount > 0 ? 'Retrying...' : 'Loading your activities...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          <p className="mb-2">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
          >
            Try Again
          </button>
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
            <p className="text-sm">Create your first activity using the + button below!</p>
          </div>
        ) : (
          activities.map((activity) => (
            <ErrorBoundary key={activity.id}>
              <ActivityCard 
                activity={activity} 
                showCreator={false}
                onDelete={handleDelete}
              />
            </ErrorBoundary>
          ))
        )}
      </div>

      <NewActivityModal
        isOpen={isModalOpen}
        onClose={onModalClose}
        onSubmit={handleNewActivity}
      />
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 rounded-md">
          <p className="text-red-600">Failed to load this activity.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MyActivities; 