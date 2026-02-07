import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Snackbar,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { addConnection, fetchUserConnections, removeConnection, fetchUserConnectionsList } from '../firebase/userActions';
import { getSafeDate } from '../utils/dateUtils';

/**
 * Interface representing a user connection in the application.
 * Contains all necessary information about a single connection.
 */
export interface Connection {
  id: string;          // Unique identifier for the connection
  userId: string;      // ID of the connected user
  email: string | null;    // Email address of the connected user
  username: string | null; // Username of the connected user (if set)
  connectedAt: any;    // Timestamp when the connection was established
  isMutual?: boolean;  // Whether this is a mutual connection (for other's profile view)
  isCurrentUser?: boolean; // Whether this connection is the current logged-in user
}

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
  onUserClick?: (userId: string) => void;  // Callback when a username is clicked (my profile only)
  viewingUserId?: string;  // If set, viewing another user's connections (not my own)
}

const ConnectionsList: React.FC<ConnectionsListProps> = ({
  hideHeader = false,
  onCountChange,
  onUserClick,
  viewingUserId
}) => {
  // State management for connections and UI states
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newConnectionEmail, setNewConnectionEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<Connection | null>(null);
  const [addingConnectionId, setAddingConnectionId] = useState<string | null>(null); // Track which connection is being added

  // Determine if viewing another user's connections
  const isViewingOther = !!viewingUserId;

  // Load connections when component mounts or viewingUserId changes
  useEffect(() => {
    loadConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingUserId]);

  // Add a refresh interval to keep connections up to date (only for own connections)
  useEffect(() => {
    if (isViewingOther) return; // Don't auto-refresh for other users

    // Refresh connections every 10 seconds
    const intervalId = setInterval(loadConnections, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewingOther]);

  /**
   * Fetches connections from Firebase
   * If viewingUserId is set, fetches that user's connections with mutual status
   * Otherwise fetches current user's connections
   */
  const loadConnections = async () => {
    try {
      setError(null);
      let fetchedConnections: Connection[];

      if (viewingUserId) {
        // Fetch another user's connections with mutual status
        fetchedConnections = await fetchUserConnectionsList(viewingUserId);
      } else {
        // Fetch own connections
        fetchedConnections = await fetchUserConnections();
      }

      console.log('Fetched connections:', fetchedConnections);
      setConnections(fetchedConnections);
      onCountChange?.(fetchedConnections.length);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setError('Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the addition of a new connection
   * Attempts to create connection with provided email address
   * Reloads connections list on success
   * Displays error message on failure
   */
  const handleAddConnection = async () => {
    if (!newConnectionEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    if (!newConnectionEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      console.log('Adding connection for email:', newConnectionEmail);
      await addConnection(newConnectionEmail.trim());
      console.log('Connection added, reloading connections...');
      await loadConnections();
      setIsAddDialogOpen(false);
      setNewConnectionEmail('');
    } catch (error) {
      console.error('Error adding connection:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to add connection');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    if (!isSubmitting) {
      setIsAddDialogOpen(false);
      setNewConnectionEmail('');
      setError(null);
    }
  };

  /**
   * Formats the connection date in a readable format
   * @param timestamp Firebase timestamp or ISO string
   * @returns Formatted date string
   */
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

  /**
   * (Removed getDateFromTimestamp helper as it's replaced by getSafeDate)
   */

  /**
   * Opens the delete confirmation dialog
   * @param connection The connection to be deleted
   */
  const openDeleteDialog = (connection: Connection) => {
    setConnectionToDelete(connection);
    setDeleteDialogOpen(true);
  };

  /**
   * Closes the delete confirmation dialog
   */
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setConnectionToDelete(null);
  };

  /**
   * Handles removing a connection after confirmation
   */
  const handleConfirmDelete = async () => {
    if (!connectionToDelete) return;

    try {
      setError(null);
      await removeConnection(connectionToDelete.userId);
      setSuccessMessage('Connection removed successfully');
      await loadConnections();
      closeDeleteDialog();
    } catch (error) {
      console.error('Error removing connection:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to remove connection');
      }
    }
  };

  return (
    <Box>
      {/* Header section with title, count and add button */}
      {!hideHeader && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Connections ({connections.length})</Typography>
          <IconButton
            color="primary"
            onClick={() => setIsAddDialogOpen(true)}
            size="small"
          >
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

      {/* Success message snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
      />

      {/* Error message display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Conditional rendering based on loading and data state */}
      {isLoading ? (
        // Loading spinner
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : connections.length === 0 ? (
        // Empty state message
        <Typography color="textSecondary" align="center">
          No connections yet
        </Typography>
      ) : (
        // List of connections (no internal scroll - use page scroll with collapse/expand)
        <Box>
          <List dense>
            {connections
              .sort((a, b) => {
                // When viewing other's connections, they're already sorted by mutual first
                if (isViewingOther) return 0;

                // For own connections, sort by date (newest first)
                const dateA = getSafeDate(a.connectedAt);
                const dateB = getSafeDate(b.connectedAt);
                if (!dateA || !dateB) return 0;
                return dateB.getTime() - dateA.getTime();
              })
              .map((connection) => (
                <ListItem
                  key={connection.id}
                  sx={{
                    py: 0.5,
                    minHeight: '48px'
                  }}
                >
                  {/* Connection details with inline date/badge */}
                  <ListItemText
                    primary={
                      <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Username - tappable only when viewing own connections */}
                        {!isViewingOther && onUserClick ? (
                          <Typography
                            variant="subtitle1"
                            component="span"
                            onClick={() => onUserClick(connection.userId)}
                            sx={{
                              cursor: 'pointer',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            {connection.username || connection.email}
                          </Typography>
                        ) : (
                          <Typography variant="subtitle1" component="span">
                            {connection.username || connection.email}
                          </Typography>
                        )}

                        {/* Connection date in compact format (only for own connections) */}
                        {!isViewingOther && connection.connectedAt && (
                          <Typography component="span" variant="body2" color="text.secondary">
                            {formatConnectionDate(connection.connectedAt)}
                          </Typography>
                        )}
                      </Box>
                    }
                  />

                  <ListItemSecondaryAction>
                    {/* For own connections: Delete button */}
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

                    {/* For other's connections: Show badges and add button (right-aligned) */}
                    {isViewingOther && connection.isCurrentUser && (
                      <Chip
                        label="You"
                        size="small"
                        color="default"
                        variant="filled"
                        sx={{ height: 20, fontSize: '0.7rem', minWidth: 55 }}
                      />
                    )}
                    {isViewingOther && connection.isMutual && !connection.isCurrentUser && (
                      <Chip
                        label="Mutual"
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem', minWidth: 55 }}
                      />
                    )}
                    {isViewingOther && !connection.isMutual && (
                      <Chip
                        label={addingConnectionId === connection.userId ? "Adding..." : "Add"}
                        size="small"
                        color="primary"
                        variant="outlined"
                        disabled={addingConnectionId === connection.userId}
                        onClick={async () => {
                          if (!connection.email) return;
                          setAddingConnectionId(connection.userId);
                          try {
                            await addConnection(connection.email);
                            setSuccessMessage(`Connected with ${connection.username || connection.email}`);
                            await loadConnections(); // Refresh to update mutual status
                          } catch (err: any) {
                            setError(err.message || 'Failed to add connection');
                          } finally {
                            setAddingConnectionId(null);
                          }
                        }}
                        sx={{
                          height: 20,
                          fontSize: '0.7rem',
                          minWidth: 55,
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: 'primary.light', color: 'primary.contrastText' }
                        }}
                      />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
          </List>
        </Box>
      )}

      {/* Add Connection Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Connection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newConnectionEmail}
            onChange={(e) => {
              setNewConnectionEmail(e.target.value);
              setError(null); // Clear error when user types
            }}
            disabled={isSubmitting}
            error={!!error}
            helperText={error}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isSubmitting) {
                handleAddConnection();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDialog}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddConnection}
            variant="contained"
            disabled={!newConnectionEmail.trim() || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Remove Connection</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove this connection?
          </Typography>
          {connectionToDelete && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">
                {connectionToDelete.username || 'No username'}
              </Typography>
              <Typography color="text.secondary">
                {connectionToDelete.email}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConnectionsList; 