import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  FormControlLabel,
  Switch,
  Tooltip,
  Snackbar
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import { Activity } from './ActivityCard';

interface EditActivitySheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (activity: Activity) => void;
  activity: Activity;
  onDelete?: () => void;  // Optional delete handler
}

const EditActivitySheet: React.FC<EditActivitySheetProps> = ({
  open,
  onClose,
  onSubmit,
  activity,
  onDelete
}) => {
  // Add debug logging
  console.log('EditActivitySheet rendered with activity:', activity);
  
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [shareSnackbar, setShareSnackbar] = useState<boolean>(false);

  // Initialize form with activity data when opened
  useEffect(() => {
    if (open && activity) {
      // Convert the date to the correct format for datetime-local input
      const date = new Date(activity.dateTime);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      setSelectedDateTime(formattedDateTime);
      setIsPrivate(activity.isPrivate || false);
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
      description: formData.get('description') as string,
      isPrivate: isPrivate
    };

    onSubmit(updatedActivity);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      onClose();
    }
  };

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/activity/${activity.id}`;
      await navigator.clipboard.writeText(url);
      setShareSnackbar(true);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
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

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  color="primary"
                />
              }
              label="Mark as private"
            />
            <Tooltip title="Share activity link">
              <Button 
                onClick={handleShare}
                aria-label="share" 
                color="primary"
                variant="outlined"
                size="small"
                startIcon={<ShareIcon />}
                sx={{ minWidth: '100px', width: 'auto', display: 'flex' }}
              >
                Share
              </Button>
            </Tooltip>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Save Changes
          </Button>

          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            fullWidth
            sx={{ mt: 1 }}
          >
            Delete Activity
          </Button>
        </Box>
      </Box>
      
      <Snackbar
        open={shareSnackbar}
        autoHideDuration={2000}
        onClose={() => setShareSnackbar(false)}
        message="Activity link copied to clipboard!"
      />
    </Drawer>
  );
};

export default EditActivitySheet; 