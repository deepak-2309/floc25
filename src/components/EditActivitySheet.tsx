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
  Snackbar,
  Collapse,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
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
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [cost, setCost] = useState<string>('');
  const [shareSnackbar, setShareSnackbar] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);

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
      setIsPaid(activity.isPaid || false);
      setCost(activity.cost ? String(activity.cost / 100) : '');
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
      isPrivate: isPrivate,
      isPaid: isPaid,
      cost: isPaid ? parseFloat(cost) * 100 : undefined,
      currency: isPaid ? 'INR' : undefined,
    };

    onSubmit(updatedActivity);
    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
      setDeleteConfirmOpen(false);
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    color="primary"
                  />
                }
                label="Private"
              />
              <Tooltip title="Share activity link">
                <Button
                  onClick={handleShare}
                  aria-label="share"
                  color="primary"
                  variant="outlined"
                  size="small"
                  startIcon={<ShareIcon />}
                  sx={{ minWidth: '100px' }}
                >
                  Share
                </Button>
              </Tooltip>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  color="primary"
                />
              }
              label="Paid activity"
            />

            <Collapse in={isPaid}>
              <TextField
                fullWidth
                label="Cost per person"
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CurrencyRupeeIcon />
                    </InputAdornment>
                  ),
                }}
                inputProps={{
                  min: 0,
                  step: 0.01
                }}
                helperText="Enter amount in INR"
                required={isPaid}
              />
            </Collapse>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              onClick={() => setDeleteConfirmOpen(true)}
              variant="contained"
              color="error"
              sx={{ flex: 1 }}
            >
              Delete Activity
            </Button>

            <Button
              type="submit"
              variant="contained"
              sx={{ flex: 1 }}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Activity?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this activity? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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