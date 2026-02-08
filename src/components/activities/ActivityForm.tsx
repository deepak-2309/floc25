import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    FormControlLabel,
    Switch,
    Tooltip,
    Collapse,
    InputAdornment,
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import { Activity } from '../../types';
import { formatDateTimeForInput } from '../../utils/dateUtils';

interface ActivityFormProps {
    initialValues?: Partial<Activity>;
    onSubmit: (activityData: Omit<Activity, 'id' | 'userId' | 'createdBy'>) => void;
    submitLabel?: string;
    showShareButton?: boolean;
    onShare?: () => void;
    slotProps?: {
        submitButton?: React.ComponentProps<typeof Button>;
    };
    children?: React.ReactNode; // For additional action buttons like Delete
}

const ActivityForm: React.FC<ActivityFormProps> = ({
    initialValues,
    onSubmit,
    submitLabel = 'Save',
    showShareButton = false,
    onShare,
    slotProps,
    children
}) => {
    // Form State
    const [name, setName] = useState(initialValues?.name || '');
    const [location, setLocation] = useState(initialValues?.location || '');
    const [description, setDescription] = useState(initialValues?.description || '');
    const [selectedDateTime, setSelectedDateTime] = useState<string>('');
    const [isPrivate, setIsPrivate] = useState<boolean>(initialValues?.isPrivate || false);
    const [isPaid, setIsPaid] = useState<boolean>(initialValues?.isPaid || false);
    const [cost, setCost] = useState<string>('');

    // Initialize state from props
    useEffect(() => {
        if (initialValues) {
            setName(initialValues.name || '');
            setLocation(initialValues.location || '');
            setDescription(initialValues.description || '');
            setIsPrivate(initialValues.isPrivate || false);
            setIsPaid(initialValues.isPaid || false);

            if (initialValues.cost) {
                setCost(String(initialValues.cost / 100));
            }

            if (initialValues.dateTime) {
                setSelectedDateTime(formatDateTimeForInput(initialValues.dateTime));
            }
        }
    }, [initialValues]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        const activityData = {
            name,
            location,
            dateTime: new Date(selectedDateTime),
            description,
            isPrivate,
            isPaid,
            cost: isPaid ? parseFloat(cost) * 100 : 0, // Store in paise
            currency: isPaid ? 'INR' : 'INR',
        };

        onSubmit(activityData);
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                // Consistent placeholder styling across all fields
                '& .MuiInputBase-input::placeholder': {
                    color: 'text.secondary',
                    opacity: 0.7,
                },
                // Hide datetime native format when empty, show placeholder instead
                '& input[type="datetime-local"]': {
                    '&::-webkit-datetime-edit': {
                        visibility: 'hidden',
                    },
                    '&::-webkit-datetime-edit-fields-wrapper': {
                        visibility: 'hidden',
                    },
                },
                '& input[type="datetime-local"][value]:not([value=""])': {
                    '&::-webkit-datetime-edit': {
                        visibility: 'visible',
                    },
                    '&::-webkit-datetime-edit-fields-wrapper': {
                        visibility: 'visible',
                    },
                },
            }}
        >
            <TextField
                required
                fullWidth
                label="Activity Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Run"
            />

            <TextField
                required
                fullWidth
                label="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., City Park"
            />

            <TextField
                required
                fullWidth
                label="Date and Time"
                type="datetime-local"
                value={selectedDateTime}
                onChange={(e) => setSelectedDateTime(e.target.value)}
                placeholder="Pick date and time"
                InputLabelProps={{
                    shrink: !!selectedDateTime,
                }}
                inputProps={{
                    style: { cursor: 'pointer' },
                }}
            />

            <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add details about your activity..."
                multiline
                rows={3}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isPrivate}
                                onChange={(e) => setIsPrivate(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Private"
                    />

                    {/* Share Button / Placeholder */}
                    <Tooltip title={showShareButton ? "Share activity link" : "Create activity first to share"}>
                        <span>
                            <Button
                                disabled={!showShareButton}
                                onClick={onShare}
                                aria-label="share"
                                color="primary"
                                variant="outlined"
                                size="small"
                                startIcon={<ShareIcon />}
                                sx={{ minWidth: '100px' }}
                            >
                                Share
                            </Button>
                        </span>
                    </Tooltip>
                </Box>

                <FormControlLabel
                    control={
                        <Switch
                            checked={isPaid}
                            onChange={(e) => setIsPaid(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Paid activity"
                />

                <Collapse in={isPaid}>
                    <TextField
                        fullWidth
                        label="Cost per person"
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder="0"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CurrencyRupeeIcon />
                                </InputAdornment>
                            ),
                        }}
                        inputProps={{
                            min: 0,
                            step: 0.01
                        }}
                        helperText="Enter amount in INR"
                        required={isPaid}
                    />
                </Collapse>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                {children}

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth={!children} // Full width if no other buttons
                    sx={{ flex: 1, ...slotProps?.submitButton?.sx }}
                    {...slotProps?.submitButton}
                >
                    {submitLabel}
                </Button>
            </Box>
        </Box>
    );
};

export default ActivityForm;
