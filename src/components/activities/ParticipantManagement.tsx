import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { Activity, ActivityJoiner, DepartedJoiner } from '../../types';
import { removeParticipant } from '../../firebase/activities';
import { initiateRefund } from '../../firebase/paymentService';
import { auth } from '../../firebase/config';

interface ParticipantManagementProps {
  activity: Activity;
  onRefresh: () => void; // Called after mutations so parent can reload
}

type RemoveDialogState = {
  open: boolean;
  userId: string;
  joiner: ActivityJoiner | null;
  refundChoice: boolean | null; // null = not decided yet (for paid events)
};

type RefundDialogState = {
  open: boolean;
  userId: string;
  departed: DepartedJoiner | null;
};

const formatRupees = (paise: number) => `₹${Math.round(paise / 100)}`;

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const RefundStatusChip: React.FC<{ status: DepartedJoiner['refundStatus'] }> = ({ status }) => {
  const map: Record<DepartedJoiner['refundStatus'], { label: string; color: 'default' | 'warning' | 'info' | 'success' | 'error' }> = {
    'n/a': { label: 'Free', color: 'default' },
    pending: { label: 'Refund pending', color: 'warning' },
    processing: { label: 'Refunding…', color: 'info' },
    completed: { label: 'Refunded', color: 'success' },
    declined: { label: 'No refund', color: 'error' },
  };
  const { label, color } = map[status] || { label: status, color: 'default' };
  return <Chip label={label} color={color} size="small" />;
};

const ParticipantManagement: React.FC<ParticipantManagementProps> = ({ activity, onRefresh }) => {
  const currentUserId = auth.currentUser?.uid;
  const isCreator = currentUserId === activity.userId;

  const [removeDialog, setRemoveDialog] = useState<RemoveDialogState>({
    open: false,
    userId: '',
    joiner: null,
    refundChoice: null,
  });
  const [refundDialog, setRefundDialog] = useState<RefundDialogState>({
    open: false,
    userId: '',
    departed: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isCreator) return null;

  const joiners = activity.joiners || {};
  const departedJoiners = activity.departedJoiners || {};

  // Sort active joiners: creator first, then by join time
  const activeEntries = Object.entries(joiners).sort(([aId], [bId]) => {
    if (aId === activity.userId) return -1;
    if (bId === activity.userId) return 1;
    return 0;
  });

  const departedEntries = Object.entries(departedJoiners).sort(
    ([, a], [, b]) => new Date(b.departedAt).getTime() - new Date(a.departedAt).getTime()
  );

  // --- Remove participant flow ---
  const openRemoveDialog = (userId: string, joiner: ActivityJoiner) => {
    setError(null);
    setRemoveDialog({ open: true, userId, joiner, refundChoice: null });
  };

  const confirmRemove = async (issueRefund: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await removeParticipant(activity.id, removeDialog.userId, issueRefund);
      setRemoveDialog({ open: false, userId: '', joiner: null, refundChoice: null });
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to remove participant');
    } finally {
      setLoading(false);
    }
  };

  // --- Refund departed participant ---
  const openRefundDialog = (userId: string, departed: DepartedJoiner) => {
    setError(null);
    setRefundDialog({ open: true, userId, departed });
  };

  const confirmRefund = async () => {
    setLoading(true);
    setError(null);
    try {
      await initiateRefund(activity.id, refundDialog.userId);
      setRefundDialog({ open: false, userId: '', departed: null });
      onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to initiate refund');
    } finally {
      setLoading(false);
    }
  };

  const hasPaidJoiner = (joiner: ActivityJoiner) =>
    activity.isPaid && (joiner.paidAmount || 0) > 0;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Active Participants */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Participants ({activeEntries.length})
      </Typography>

      {activeEntries.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No participants yet.
        </Typography>
      ) : (
        <List disablePadding>
          {activeEntries.map(([userId, joiner]) => {
            const isCreatorEntry = userId === activity.userId;
            return (
              <ListItem
                key={userId}
                disablePadding
                sx={{
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  alignItems: 'flex-start',
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" sx={{ fontWeight: isCreatorEntry ? 600 : 400 }}>
                        {joiner.username || joiner.email}
                      </Typography>
                      {isCreatorEntry && (
                        <Chip label="Creator" size="small" color="primary" variant="outlined" />
                      )}
                      {activity.isPaid && (
                        <Chip
                          icon={<CurrencyRupeeIcon sx={{ fontSize: 12 }} />}
                          label={
                            isCreatorEntry
                              ? 'Free'
                              : joiner.paymentStatus === 'completed'
                              ? formatRupees(joiner.paidAmount || 0)
                              : joiner.paymentStatus || 'unpaid'
                          }
                          size="small"
                          color={joiner.paymentStatus === 'completed' ? 'success' : 'default'}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  }
                  secondary={`Joined ${formatDate(joiner.joinedAt as unknown as string)}`}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                {!isCreatorEntry && activity.status === 'active' && (
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      size="small"
                      aria-label="remove participant"
                      onClick={() => openRemoveDialog(userId, joiner)}
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            );
          })}
        </List>
      )}

      {/* Departed Participants */}
      {departedEntries.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Departed ({departedEntries.length})
          </Typography>
          <List disablePadding>
            {departedEntries.map(([userId, departed]) => (
              <ListItem
                key={userId}
                disablePadding
                sx={{
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  alignItems: 'flex-start',
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2">
                        {departed.username || departed.email}
                      </Typography>
                      <Chip
                        label={departed.departedReason === 'removed_by_creator' ? 'Removed' : 'Left'}
                        size="small"
                        variant="outlined"
                      />
                      <RefundStatusChip status={departed.refundStatus} />
                    </Box>
                  }
                  secondary={
                    <>
                      {`Left ${formatDate(departed.departedAt)}`}
                      {departed.paidAmount > 0 && ` · Paid ${formatRupees(departed.paidAmount)}`}
                    </>
                  }
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                {departed.refundStatus === 'pending' && (
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => openRefundDialog(userId, departed)}
                    >
                      Refund
                    </Button>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Remove Participant Dialog */}
      <Dialog open={removeDialog.open} onClose={() => !loading && setRemoveDialog(s => ({ ...s, open: false }))}>
        <DialogTitle>Remove {removeDialog.joiner?.username || removeDialog.joiner?.email}?</DialogTitle>
        <DialogContent>
          {hasPaidJoiner(removeDialog.joiner!) ? (
            <DialogContentText>
              Would you like to refund their{' '}
              {formatRupees(removeDialog.joiner?.paidAmount || 0)}?
            </DialogContentText>
          ) : (
            <DialogContentText>
              Remove this participant from the event?
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveDialog(s => ({ ...s, open: false }))} disabled={loading}>
            Cancel
          </Button>
          {hasPaidJoiner(removeDialog.joiner!) ? (
            <>
              <Button onClick={() => confirmRemove(false)} disabled={loading} color="inherit">
                Remove, no refund
              </Button>
              <Button onClick={() => confirmRemove(true)} disabled={loading} variant="contained" color="primary">
                {loading ? <CircularProgress size={18} /> : 'Remove & refund'}
              </Button>
            </>
          ) : (
            <Button onClick={() => confirmRemove(false)} disabled={loading} color="error" variant="contained">
              {loading ? <CircularProgress size={18} /> : 'Remove'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Refund Departed Participant Dialog */}
      <Dialog open={refundDialog.open} onClose={() => !loading && setRefundDialog(s => ({ ...s, open: false }))}>
        <DialogTitle>Refund {refundDialog.departed?.username || refundDialog.departed?.email}?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Refund {formatRupees(refundDialog.departed?.paidAmount || 0)} to{' '}
            {refundDialog.departed?.username || refundDialog.departed?.email}? This cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialog(s => ({ ...s, open: false }))} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={confirmRefund} disabled={loading} variant="contained" color="primary">
            {loading ? <CircularProgress size={18} /> : 'Refund'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParticipantManagement;
