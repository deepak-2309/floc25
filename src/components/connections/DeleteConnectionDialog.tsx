import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    Box,
} from '@mui/material';
import { Connection } from '../../types';

interface DeleteConnectionDialogProps {
    open: boolean;
    connection: Connection | null;
    onClose: () => void;
    onConfirm: () => void;
}

/**
 * DeleteConnectionDialog Component
 * 
 * A confirmation dialog for removing a connection.
 */
const DeleteConnectionDialog: React.FC<DeleteConnectionDialogProps> = ({
    open,
    connection,
    onClose,
    onConfirm,
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Remove Connection</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to remove this connection?
                </Typography>
                {connection && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1">
                            {connection.username || 'No username'}
                        </Typography>
                        <Typography color="text.secondary">
                            {connection.email}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Remove
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DeleteConnectionDialog;
