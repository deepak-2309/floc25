import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from '@mui/material';

interface AddConnectionDialogProps {
    open: boolean;
    onClose: () => void;
    onAdd: (email: string) => Promise<void>;
}

/**
 * AddConnectionDialog Component
 * 
 * A dialog for adding a new connection by email address.
 */
const AddConnectionDialog: React.FC<AddConnectionDialogProps> = ({
    open,
    onClose,
    onAdd,
}) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAdd = async () => {
        if (!email.trim()) {
            setError('Please enter an email address');
            return;
        }
        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);
            await onAdd(email.trim());
            handleClose();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Failed to add connection');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setEmail('');
            setError(null);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Connection</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Email Address"
                    type="email"
                    fullWidth
                    variant="outlined"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                    }}
                    disabled={isSubmitting}
                    error={!!error}
                    helperText={error}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isSubmitting) {
                            handleAdd();
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button
                    onClick={handleAdd}
                    variant="contained"
                    disabled={!email.trim() || isSubmitting}
                >
                    {isSubmitting ? 'Adding...' : 'Add'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddConnectionDialog;
