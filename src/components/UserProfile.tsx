import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, IconButton, Alert, CircularProgress } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ConnectionsList from './ConnectionsList';
import PastActivities from './PastActivities';
import CollapsibleSection from './CollapsibleSection';
import { fetchUserProfile } from '../firebase/userActions';

/**
 * UserProfile Component
 * 
 * Displays another user's profile information:
 * - Username and email (read-only)
 * - List of their connections (with mutual badges, add buttons for non-mutual)
 * - Their public/shared past activities (via PastActivities component)
 */
interface UserProfileProps {
    userId: string;          // ID of the user to display
    onBack: () => void;      // Callback to navigate back
}

interface UserData {
    id: string;
    username: string | null;
    email: string | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, onBack }) => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connectionsCount, setConnectionsCount] = useState(0);
    const [pastActivitiesCount, setPastActivitiesCount] = useState(0);

    // Fetch user profile data
    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const profile = await fetchUserProfile(userId);
                setUserData(profile);
            } catch (err: any) {
                console.error('Error loading user profile:', err);
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [userId]);

    const handleCountChange = useCallback((count: number) => {
        setConnectionsCount(count);
    }, []);

    const handleActivitiesCountChange = useCallback((count: number) => {
        setPastActivitiesCount(count);
    }, []);

    if (loading) {
        return (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <IconButton onClick={onBack} aria-label="go back">
                    <ArrowBackIcon />
                </IconButton>
            </Box>
        );
    }

    const displayName = userData?.username || userData?.email || 'User';

    return (
        <Box sx={{ p: 2, pb: 12 }}>
            {/* Header with back button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <IconButton onClick={onBack} aria-label="go back" edge="start">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {displayName}'s Profile
                </Typography>
            </Box>

            {/* Profile Information Card */}
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box sx={{ mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {userData?.username || 'No username set'}
                    </Typography>
                </Box>

                {/* User Email Display */}
                <Typography variant="body2" color="text.secondary">
                    {userData?.email}
                </Typography>
            </Paper>

            {/* Connections List */}
            <CollapsibleSection title="Connections" count={connectionsCount}>
                <ConnectionsList
                    hideHeader
                    onCountChange={handleCountChange}
                    viewingUserId={userId}
                />
            </CollapsibleSection>

            {/* Past Activities Component */}
            <CollapsibleSection title="Past Activities" count={pastActivitiesCount}>
                <PastActivities
                    userId={userId}
                    hideHeader
                    onCountChange={handleActivitiesCountChange}
                />
            </CollapsibleSection>
        </Box>
    );
};

export default UserProfile;
