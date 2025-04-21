import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  TextField,
  Button,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Activity } from './ActivityCard';

interface EditActivitySheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (activity: Activity) => void;
  activity: Activity;
}

const EditActivitySheet: React.FC<EditActivitySheetProps> = ({
  open,
  onClose,
  onSubmit,
  activity
}) => {
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');

  // Initialize form with activity data when opened
  useEffect(() => {
    if (open && activity) {
      setSelectedDateTime(activity.dateTime.toISOString().slice(0, 16));
    }
  }, [open, activity]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const updatedActivity = {
      ...activity,
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      dateTime: new Date(selectedDateTime),
      description: formData.get('description') as string
    };

    onSubmit(updatedActivity);
    onClose();
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '80vh'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Edit Activity</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            required
            fullWidth
            label="Activity Name"
            name="name"
            defaultValue={activity.name}
            placeholder="e.g., Morning Run"
          />
          
          <TextField
            required
            fullWidth
            label="Location"
            name="location"
            defaultValue={activity.location}
            placeholder="e.g., City Park"
          />
          
          <TextField
            required
            fullWidth
            label="Date and Time"
            type="datetime-local"
            value={selectedDateTime}
            onChange={(e) => setSelectedDateTime(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
          />

        <TextField
            fullWidth
            label="Description"
            name="description"
            defaultValue={activity.description}
            placeholder="Add details about your activity..."
            multiline
            rows={3}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default EditActivitySheet; 