import React, { useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Activity } from '../../types';
import ActivityForm from './ActivityForm';

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

  const handleSubmit = (activityData: Omit<Activity, 'id' | 'userId' | 'createdBy'>) => {
    const newActivity = {
      ...activityData,
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

        <ActivityForm
          onSubmit={handleSubmit}
          submitLabel="Create Activity"
          showShareButton={false} // Cannot share before creation
        />
      </Box>
    </Drawer>
  );
};

export default CreateActivitySheet;