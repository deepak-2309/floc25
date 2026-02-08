import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Activity } from '../../types';
import ActivityForm from './ActivityForm';

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
  const [shareSnackbar, setShareSnackbar] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);

  const handleSubmit = (activityData: Omit<Activity, 'id' | 'userId' | 'createdBy'>) => {
    const updatedActivity = {
      ...activity,
      ...activityData
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

        <ActivityForm
          initialValues={activity}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          showShareButton={true}
          onShare={handleShare}
        >
          {/* Inject Delete Button as a child to ActivityForm */}
          <Button
            onClick={() => setDeleteConfirmOpen(true)}
            variant="contained"
            color="error"
            sx={{ flex: 1 }}
          >
            Delete Activity
          </Button>
        </ActivityForm>
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