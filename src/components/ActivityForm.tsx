import React, { useState } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Activity } from '../types/Activity';

interface ActivityFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({ onCancel, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, 'activities'), {
        title,
        description,
        createdAt: new Date(),
      });
      onSuccess();
    } catch (err) {
      setError('Failed to create activity. Please try again.');
      console.error('Error adding activity:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 600, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Add New Activity
      </Typography>
      
      <TextField
        fullWidth
        label="Title"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
        margin="normal"
        required
      />
      
      <TextField
        fullWidth
        label="Description"
        value={description}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
        margin="normal"
        multiline
        rows={4}
        required
      />

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Activity'}
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}; 