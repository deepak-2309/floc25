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
  Button,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Activity } from '../../types';
import ActivityForm from './ActivityForm';
import ParticipantManagement from './ParticipantManagement';

interface EditActivitySheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (activity: Activity) => void;
  activity: Activity;
  onDelete?: () => void;
  onCancel?: () => void;  // Soft-cancel handler for paid events
  onRefresh?: () => void;
}

const EditActivitySheet: React.FC<EditActivitySheetProps> = ({
  open,
  onClose,
  onSubmit,
  activity,
  onDelete,
  onCancel,
  onRefresh,
}) => {
  const [shareSnackbar, setShareSnackbar] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState<boolean>(false);

  // Determine if any paid participants exist (excluding creator who paid 0)
  const hasPaidParticipants =
    activity.isPaid &&
    Object.values(activity.joiners || {}).some(
      (j) => (j.paidAmount || 0) > 0
    );

  const paidCount = activity.isPaid
    ? Object.values(activity.joiners || {}).filter((j) => (j.paidAmount || 0) > 0).length
    : 0;

  const totalCollected = activity.paymentDetails?.totalCollected || 0;
  const formatRupees = (paise: number) => `₹${Math.round(paise / 100)}`;

  const handleSubmit = (activityData: Omit<Activity, 'id' | 'userId' | 'createdBy'>) => {
    const updatedActivity = { ...activity, ...activityData };
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

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      setCancelConfirmOpen(false);
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
          {hasPaidParticipants ? (
            <Button
              onClick={() => setCancelConfirmOpen(true)}
              variant="contained"
              color="error"
              sx={{ flex: 1 }}
            >
              Cancel Event
            </Button>
          ) : (
            <Button
              onClick={() => setDeleteConfirmOpen(true)}
              variant="contained"
              color="error"
              sx={{ flex: 1 }}
            >
              Delete Activity
            </Button>
          )}
        </ActivityForm>

        {/* Participant Management - creator only */}
        {Object.keys(activity.joiners || {}).filter(uid => uid !== activity.userId).length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <ParticipantManagement
              activity={activity}
              onRefresh={() => {
                if (onRefresh) onRefresh();
                onClose();
              }}
            />
          </Box>
        )}
      </Box>

      {/* Hard delete confirmation (free events / no paid participants) */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
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

      {/* Soft cancel confirmation (paid events with paid participants) */}
      <Dialog open={cancelConfirmOpen} onClose={() => setCancelConfirmOpen(false)}>
        <DialogTitle>Cancel Event?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Cancelling will automatically refund all {paidCount} paid participant{paidCount !== 1 ? 's' : ''} ({formatRupees(totalCollected)} total). The event record will be kept. This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelConfirmOpen(false)}>Go Back</Button>
          <Button onClick={handleCancel} color="error" variant="contained">
            Cancel Event
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
