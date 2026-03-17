import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box, Button, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { auth } from '../../firebase/config';
import { Activity } from '../../types';

export type { Activity } from '../../types';

interface ActivityCardProps {
  activity: Activity;
  onEdit?: () => void;
  onJoinToggle?: () => void;
  isJoined?: boolean;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onEdit,
  onJoinToggle,
  isJoined = false,
}) => {
  const isCreator = auth.currentUser?.uid === activity.userId;

  const formatDateTime = (date: Date) => {
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${dateStr} at ${timeStr}`;
  };

  const formatCost = (costInPaise: number) => {
    return Math.round(costInPaise / 100).toString();
  };

  const getCurrentUserPaymentStatus = () => {
    if (!activity.joiners || !auth.currentUser) return null;
    return activity.joiners[auth.currentUser.uid]?.paymentStatus || null;
  };

  const userPaymentStatus = getCurrentUserPaymentStatus();
  const joinersCount = activity.joiners ? Object.keys(activity.joiners).length : 0;
  const isCancelled = activity.status === 'cancelled';
  const isCompleted = activity.status === 'completed';
  const isFull =
    !isCreator &&
    activity.maxParticipants != null &&
    joinersCount >= activity.maxParticipants;

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleTooltipToggle = () => {
    setTooltipOpen(!tooltipOpen);
  };

  const getJoinButton = () => {
    if (!onJoinToggle || isCreator || activity.allowJoin === false) return null;

    if (isCancelled || isCompleted) return null;

    if (!isJoined && isFull) {
      return (
        <Button variant="outlined" size="small" disabled sx={{ mt: -1, mr: -1 }}>
          Full
        </Button>
      );
    }

    return (
      <Button
        variant={isJoined ? 'outlined' : 'contained'}
        onClick={onJoinToggle}
        size="small"
        sx={{ mt: -1, mr: -1 }}
        disabled={activity.isPaid && userPaymentStatus === 'pending'}
      >
        {isJoined ? 'Leave' : 'Join'}
      </Button>
    );
  };

  return (
    <Card sx={{ mb: 2, opacity: isCancelled ? 0.7 : 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
              {activity.name}
              {activity.isPrivate && (
                <LockIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              )}
              {activity.isPaid && (
                <Chip
                  icon={<CurrencyRupeeIcon />}
                  label={formatCost(activity.cost || 0)}
                  size="small"
                  color="primary"
                />
              )}
              {isCancelled && (
                <Chip
                  icon={<BlockIcon />}
                  label="Cancelled"
                  size="small"
                  color="error"
                />
              )}
              {isCompleted && (
                <Chip
                  icon={<CheckCircleOutlineIcon />}
                  label="Completed"
                  size="small"
                  color="success"
                />
              )}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {activity.location}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {formatDateTime(activity.dateTime)}
            </Typography>
            {activity.description && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                {activity.description}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            {getJoinButton()}
            {onEdit && isCreator && !isCancelled && (
              <IconButton
                aria-label="edit"
                onClick={onEdit}
                sx={{ mt: -1, mr: -1 }}
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography color="textSecondary" variant="body2">
            by {activity.createdBy}
          </Typography>
          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={handleTooltipToggle}
          >
            <GroupIcon sx={{ mr: 0.5 }} />
            <Typography variant="body2">
              {activity.maxParticipants
                ? `${joinersCount}/${activity.maxParticipants}`
                : joinersCount}
            </Typography>
          </Box>
        </Box>

        {tooltipOpen && joinersCount > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Joined:
            </Typography>
            {Object.entries(activity.joiners || {})
              .sort((a, b) => new Date(a[1].joinedAt as any).getTime() - new Date(b[1].joinedAt as any).getTime())
              .map(([, joiner], index) => (
                <Box key={index} sx={{ display: 'flex', pl: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 24, textAlign: 'right', mr: 0.5 }}>
                    {index + 1}.
                  </Typography>
                  <Typography variant="body2">
                    {joiner.username || joiner.email}
                  </Typography>
                </Box>
              ))
            }
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
