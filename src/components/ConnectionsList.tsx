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
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { addConnection, fetchUserConnections } from '../firebase';

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

  // Load connections when component mounts
  useEffect(() => {
    loadConnections();
  }, []);

  /**
   * Fetches the user's connections from Firebase
   * Updates the connections state and handles loading/error states
   */
  const loadConnections = async () => {
    try {
      setIsLoading(true);
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

  return (
    <Box sx={{ mt: 4 }}>
      {/* Header section with title and add button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Connections</Typography>
        <IconButton
          color="primary"
          onClick={() => setIsAddDialogOpen(true)}
          size="small"
        >
          <AddIcon />
        </IconButton>
      </Box>

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
        <Typography color="text.secondary" align="center">
          No connections yet
        </Typography>
      ) : (
        // List of connections
        <List>
          {connections.map((connection) => (
            <ListItem key={connection.id}>
              <ListItemText
                primary={connection.username || connection.email}
                secondary={!connection.username && connection.email}
              />
            </ListItem>
          ))}
        </List>
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
    </Box>
  );
};

export default ConnectionsList; 