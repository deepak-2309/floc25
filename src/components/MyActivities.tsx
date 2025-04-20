import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Activity } from '../types/Activity';
import { useAuth } from '../contexts/AuthContext';
import ActivityForm from './ActivityForm';
import ActivityCard from './ActivityCard';
import { addActivity } from '../services/firestore';
import { CircularProgress, Typography, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const MyActivities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const fetchActivities = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', '==', user.uid),
        orderBy('datetime', 'desc')
      );
      
      const querySnapshot = await getDocs(activitiesQuery);
      const activitiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Activity[];
      
      setActivities(activitiesData);
      setError(null);
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user]);

  const handleAddActivity = async (activity: Omit<Activity, 'id'>) => {
    if (!user) return;
    
    try {
      await addActivity(activity, user.uid, user.email || '');
      await fetchActivities();
      setShowForm(false);
    } catch (err) {
      console.error('Error adding activity:', err);
      setError('Failed to add activity. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" component="h2">
          My Activities
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
        >
          Add Activity
        </Button>
      </Box>

      {showForm && (
        <Box mb={3}>
          <ActivityForm
            onSubmit={handleAddActivity}
            onCancel={() => setShowForm(false)}
          />
        </Box>
      )}

      {activities.length === 0 ? (
        <Typography variant="body1" textAlign="center" mt={4}>
          You haven't added any activities yet. Click the button above to add your first activity!
        </Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {activities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              onDelete={fetchActivities}
              showActions={true}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MyActivities; 