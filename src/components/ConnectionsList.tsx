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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { addConnection, fetchUserConnections, removeConnection } from '../firebase/userActions';

/**
 * Interface representing a user connection in the application.
 * Contains all necessary information about a single connection.
 */
interface Connection {
  id: string;          // Unique identifier for the connection
  userId: string;      // ID of the connected user
  email: string | null;    // Email address of the connected user
  username: string | null; // Username of the connected user (if set)
  connectedAt: any;    // Timestamp when the connection was established
}

/**
 * ConnectionsList Component
 * 
 * Displays a list of user connections and provides functionality to add new connections.
 * Shows either username or email for each connection, with username taking precedence if available.
 * Includes an "Add Connection" button that opens a dialog for entering a new connection's email.
 */
const ConnectionsList: React.FC = () => {
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

  // Load connections when component mounts
  useEffect(() => {
    loadConnections();
  }, []);

  // Add a refresh interval to keep connections up to date
  useEffect(() => {
    // Refresh connections every 10 seconds
    const intervalId = setInterval(loadConnections, 10000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  /**
   * Fetches the user's connections from Firebase
   * Updates the connections state and handles loading/error states
   */
  const loadConnections = async () => {
    try {
      setError(null);
      const fetchedConnections = await fetchUserConnections();
      console.log('Fetched connections:', fetchedConnections);
      setConnections(fetchedConnections);
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
   * @param timestamp Firebase timestamp
   * @returns Formatted date string
   */
  const formatConnectionDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
        // List of connections with fixed height and scrolling (shows 3 items at a time)
        <Box sx={{ 
          maxHeight: '144px', // Height to show exactly 3 items (48px per item)
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
          },
        }}>
          <List dense>
            {connections
              .sort((a, b) => b.connectedAt?.toDate() - a.connectedAt?.toDate())
              .map((connection) => (
              <ListItem 
                key={connection.id}
                sx={{ 
                  py: 0.5,
                  minHeight: '48px'
                }}
              >
                {/* Connection details with inline date */}
                <ListItemText
                  primary={
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" component="span">
                        {connection.username || connection.email}
                      </Typography>
                      {/* Connection date in compact format */}
                      {connection.connectedAt && (
                        <Typography component="span" variant="body2" color="text.secondary">
                          (since {formatConnectionDate(connection.connectedAt)})
                        </Typography>
                      )}
                    </Box>
                  }
                  secondary={!connection.username && connection.email}
                  secondaryTypographyProps={{ variant: "body2" }}
                />
                {/* Delete connection button */}
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="remove connection"
                    onClick={() => openDeleteDialog(connection)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
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