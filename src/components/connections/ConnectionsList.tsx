import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { addConnection, fetchUserConnections, removeConnection, fetchUserConnectionsList } from '../../firebase/userActions';
import { getSafeDate } from '../../utils/dateUtils';
import { Connection } from '../../types';
import { AddConnectionDialog, DeleteConnectionDialog } from './';

// Re-export Connection type for backward compatibility
export type { Connection } from '../../types';

/**
 * ConnectionsList Component
 * 
 * Displays a list of user connections and provides functionality to add new connections.
 * Shows either username or email for each connection, with username taking precedence if available.
 * Includes an "Add Connection" button that opens a dialog for entering a new connection's email.
 * 
 * When viewing another user's connections (viewingUserId is set):
 * - Usernames are NOT tappable
 * - Shows "Mutual" badge for mutual connections
 * - Shows "Add" button for non-mutual connections
 */
interface ConnectionsListProps {
  hideHeader?: boolean;
  onCountChange?: (count: number) => void;
  onUserClick?: (userId: string) => void;
  viewingUserId?: string;
}

const ConnectionsList: React.FC<ConnectionsListProps> = ({
  hideHeader = false,
  onCountChange,
  onUserClick,
  viewingUserId
}) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<Connection | null>(null);
  const [addingConnectionId, setAddingConnectionId] = useState<string | null>(null);

  const isViewingOther = !!viewingUserId;

  useEffect(() => {
    loadConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingUserId]);

  useEffect(() => {
    if (isViewingOther) return;
    const intervalId = setInterval(loadConnections, 10000);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewingOther]);

  const loadConnections = async () => {
    try {
      setError(null);
      let fetchedConnections: Connection[];

      if (viewingUserId) {
        fetchedConnections = await fetchUserConnectionsList(viewingUserId);
      } else {
        fetchedConnections = await fetchUserConnections();
      }

      setConnections(fetchedConnections);
      onCountChange?.(fetchedConnections.length);
    } catch (err) {
      console.error('Error fetching connections:', err);
      setError('Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddConnection = async (email: string) => {
    await addConnection(email);
    await loadConnections();
  };

  const formatConnectionDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = getSafeDate(timestamp);
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const openDeleteDialog = (connection: Connection) => {
    setConnectionToDelete(connection);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setConnectionToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!connectionToDelete) return;
    try {
      setError(null);
      await removeConnection(connectionToDelete.userId);
      setSuccessMessage('Connection removed successfully');
      await loadConnections();
      closeDeleteDialog();
    } catch (err) {
      console.error('Error removing connection:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to remove connection');
      }
    }
  };

  const handleQuickAdd = async (connection: Connection) => {
    if (!connection.email) return;
    setAddingConnectionId(connection.userId);
    try {
      await addConnection(connection.email);
      setSuccessMessage(`Connected with ${connection.username || connection.email}`);
      await loadConnections();
    } catch (err: any) {
      setError(err.message || 'Failed to add connection');
    } finally {
      setAddingConnectionId(null);
    }
  };

  return (
    <Box>
      {/* Header section */}
      {!hideHeader && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Connections ({connections.length})</Typography>
          <IconButton color="primary" onClick={() => setIsAddDialogOpen(true)} size="small">
            <AddIcon />
          </IconButton>
        </Box>
      )}
      {hideHeader && !isViewingOther && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button
            color="primary"
            onClick={() => setIsAddDialogOpen(true)}
            size="small"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none' }}
          >
            Add New
          </Button>
        </Box>
      )}

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : connections.length === 0 ? (
        <Typography color="textSecondary" align="center">
          No connections yet
        </Typography>
      ) : (
        <Box>
          <List dense>
            {connections
              .sort((a, b) => {
                if (isViewingOther) return 0;
                const dateA = getSafeDate(a.connectedAt);
                const dateB = getSafeDate(b.connectedAt);
                if (!dateA || !dateB) return 0;
                return dateB.getTime() - dateA.getTime();
              })
              .map((connection) => (
                <ListItem key={connection.id} sx={{ py: 0.5, minHeight: '48px' }}>
                  <ListItemText
                    primary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {!isViewingOther && onUserClick ? (
                          <Typography
                            variant="subtitle1"
                            component="span"
                            onClick={() => onUserClick(connection.userId)}
                            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                          >
                            {connection.username || connection.email}
                          </Typography>
                        ) : (
                          <Typography variant="subtitle1" component="span">
                            {connection.username || connection.email}
                          </Typography>
                        )}
                        {!isViewingOther && connection.connectedAt && (
                          <Typography component="span" variant="body2" color="text.secondary">
                            {formatConnectionDate(connection.connectedAt)}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    {!isViewingOther && (
                      <IconButton
                        edge="end"
                        aria-label="remove connection"
                        onClick={() => openDeleteDialog(connection)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                    {isViewingOther && connection.isCurrentUser && (
                      <Chip label="You" size="small" color="default" variant="filled" sx={{ height: 20, fontSize: '0.7rem', minWidth: 55 }} />
                    )}
                    {isViewingOther && connection.isMutual && !connection.isCurrentUser && (
                      <Chip label="Mutual" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.7rem', minWidth: 55 }} />
                    )}
                    {isViewingOther && !connection.isMutual && (
                      <Chip
                        label={addingConnectionId === connection.userId ? "Adding..." : "Add"}
                        size="small"
                        color="primary"
                        variant="outlined"
                        disabled={addingConnectionId === connection.userId}
                        onClick={() => handleQuickAdd(connection)}
                        sx={{ height: 20, fontSize: '0.7rem', minWidth: 55, cursor: 'pointer', '&:hover': { backgroundColor: 'primary.light', color: 'primary.contrastText' } }}
                      />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
          </List>
        </Box>
      )}

      <AddConnectionDialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddConnection}
      />

      <DeleteConnectionDialog
        open={deleteDialogOpen}
        connection={connectionToDelete}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
};

export default ConnectionsList;