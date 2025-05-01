import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, Collapse } from '@mui/material';
import { Activity } from './ActivityCard';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

/**
 * Interface for PastActivityCard props
 */
interface PastActivityCardProps {
  activity: Activity;  // Activity data to display
}

/**
 * PastActivityCard Component
 * 
 * Displays a single past activity in a compact, expandable card format.
 * The card has two states:
 * 1. Collapsed (default): Shows only activity name and date
 * 2. Expanded: Shows all activity details including location, description, and participants
 * 
 * Features:
 * - Clickable card that expands/collapses
 * - Hover effect for better interactivity
 * - Compact design to save space
 * - Visual indicator (arrow) for expandable state
 */
const PastActivityCard: React.FC<PastActivityCardProps> = ({ activity }) => {
  // State to track expanded/collapsed state
  const [expanded, setExpanded] = useState(false);

  /**
   * Formats the date in a compact, readable format
   * @param date The date to format
   * @returns Formatted date string (e.g., "Jan 1, 2024")
   */
  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  /**
   * Toggles the expanded/collapsed state of the card
   */
  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card 
      sx={{ 
        mb: 1, 
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover'
        }
      }}
      onClick={handleExpandClick}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        {/* Compact View - Always Visible */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" component="div" noWrap sx={{ flex: 1 }}>
            {activity.name}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {formatDateTime(activity.dateTime)}
            </Typography>
            {/* Expansion Indicator */}
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </Box>
        </Box>

        {/* Expanded View - Only visible when expanded */}
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ mt: 2 }}>
            {/* Activity Details */}
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Location: {activity.location}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Created by: {activity.createdBy}
            </Typography>
            {/* Optional Description */}
            {activity.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {activity.description}
              </Typography>
            )}
            {/* Participants Count */}
            {activity.joiners && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Participants: {Object.values(activity.joiners).length}
              </Typography>
            )}
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default PastActivityCard; 