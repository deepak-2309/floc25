import React, { useState } from 'react';
import { Card, CardContent, Typography, IconButton, Box, Button, Chip, alpha } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import GroupIcon from '@mui/icons-material/Group';
import LockIcon from '@mui/icons-material/Lock';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PaymentIcon from '@mui/icons-material/Payment';
import { auth } from '../firebase/config';

/**
 * Interface representing an activity in the application.
 * Contains all necessary information about a single activity.
 */
export interface Activity {
  id: string;          // Unique identifier for the activity
  name: string;        // Name/title of the activity
  createdBy: string;   // Name of the user who created the activity
  userId: string;      // ID of the user who created the activity
  location: string;    // Location where the activity will take place
  dateTime: Date;      // Date and time when the activity is scheduled
  description: string; // Description of the activity
  allowJoin?: boolean; // Whether the current user is allowed to join this activity
  isPrivate?: boolean; // Whether the activity is marked as private (not visible to connections)
  isPaid?: boolean;    // Whether the activity requires payment to join
  cost?: number;       // Cost in INR (stored in paise for Razorpay)
  currency?: string;   // Currency code (e.g., 'INR')
  paymentDetails?: {   // Payment tracking information
    totalCollected?: number;
    participantCount?: number;
  };
  joiners?: {          // Map of users who have joined the activity
    [userId: string]: {
      email: string;
      username?: string;
      joinedAt: Date;
      paymentStatus?: 'pending' | 'completed' | 'failed'; // Payment status for paid activities
      paymentId?: string;        // Razorpay payment ID
      razorpayOrderId?: string;  // Razorpay order ID
      paidAmount?: number;       // Amount paid in paise
      paidAt?: Date;            // When payment was completed
    }
  };
}

/**
 * Props interface for the ActivityCard component.
 * Defines the expected properties that can be passed to the component.
 */
interface ActivityCardProps {
  activity: Activity;              // The activity data to display
  onEdit?: () => void;            // Callback function for edit action (optional)
  onJoinToggle?: () => void;      // Callback function for join/unjoin action (optional)
  isJoined?: boolean;             // Whether the current user has joined this activity
}

/**
 * ActivityCard Component
 * 
 * Displays an activity in a Material-UI Card format with the following layout:
 * - Header: Activity name with optional edit button for creators
 * - Body: Location, date/time, and optional description
 * - Footer: Creator name, joiners count, and join/leave button
 */
const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onEdit,
  onJoinToggle,
  isJoined = false,
}) => {
  // Check if current user is the creator of the activity
  const isCreator = auth.currentUser?.uid === activity.userId;

  // Format date and time using native JavaScript
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

  // Format cost for display (convert paise to rupees, no decimals)
  const formatCost = (costInPaise: number) => {
    return Math.round(costInPaise / 100).toString();
  };

  // Get current user's payment status
  const getCurrentUserPaymentStatus = () => {
    if (!activity.joiners || !auth.currentUser) return null;
    return activity.joiners[auth.currentUser.uid]?.paymentStatus || null;
  };

  const userPaymentStatus = getCurrentUserPaymentStatus();

  // Get number of joiners
  const joinersCount = activity.joiners ? Object.keys(activity.joiners).length : 0;

  const [tooltipOpen, setTooltipOpen] = useState(false);

  const handleTooltipToggle = () => {
    setTooltipOpen(!tooltipOpen);
  };

  return (
    <Card sx={{ mb: 2, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04) }}>
      <CardContent>
        {/* Header section with activity name and action buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
              {activity.name}
              {activity.isPrivate && (
                <LockIcon fontSize="small" sx={{ ml: 1, color: 'text.secondary' }} />
              )}
              {activity.isPaid && (
                <Chip
                  icon={<CurrencyRupeeIcon />}
                  label={formatCost(activity.cost || 0)}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
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
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {onJoinToggle && !isCreator && activity.allowJoin !== false && (
              <Button
                variant={isJoined ? "outlined" : "contained"}
                onClick={onJoinToggle}
                size="small"
                sx={{ mt: -1, mr: -1 }}
                disabled={activity.isPaid && userPaymentStatus === 'pending'}
                startIcon={activity.isPaid && !isJoined ? <PaymentIcon /> : undefined}
              >
                {isJoined ? 'Leave' :
                  activity.isPaid ? `Pay ₹${formatCost(activity.cost || 0)}` : 'Join'}
              </Button>
            )}
            {onEdit && isCreator && (
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

        {/* Footer section with creator name and joiners count */}
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
              {joinersCount}
            </Typography>
          </Box>
        </Box>

        {/* Expandable joiners list */}
        {tooltipOpen && joinersCount > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
              Joined:
            </Typography>
            {Object.entries(activity.joiners || {})
              .sort((a, b) => new Date(a[1].joinedAt).getTime() - new Date(b[1].joinedAt).getTime())
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