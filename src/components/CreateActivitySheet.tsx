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
  Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import { Activity } from './ActivityCard';

interface CreateActivitySheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (activity: Omit<Activity, 'id'>) => void;
}

const CreateActivitySheet: React.FC<CreateActivitySheetProps> = ({
  open,
  onClose,
  onSubmit
}) => {
  const [selectedDateTime, setSelectedDateTime] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);

  // Reset form when sheet is closed
  useEffect(() => {
    if (!open) {
      setSelectedDateTime('');
      setIsPrivate(false);
    }
  }, [open]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const newActivity = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      dateTime: new Date(selectedDateTime),
      description: formData.get('description') as string,
      isPrivate: isPrivate,
      userId: '', // This will be set by the writeActivity function
      createdBy: '', // This will be set by the writeActivity function
    };

    onSubmit(newActivity);
    onClose(); // Close the form automatically after submission
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
          <Typography variant="h6">Create New Activity</Typography>
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
            placeholder="e.g., Morning Run"
          />
          
          <TextField
            required
            fullWidth
            label="Location"
            name="location"
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
            <Tooltip title="Create activity first to share - you'll get a share option after creation">
              <span>
                <Button 
                  disabled={true}
                  aria-label="share" 
                  color="primary"
                  variant="outlined"
                  size="small"
                  startIcon={<ShareIcon />}
                  sx={{ minWidth: '100px' }}
                >
                  Share
                </Button>
              </span>
            </Tooltip>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
          >
            Create Activity
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default CreateActivitySheet; 