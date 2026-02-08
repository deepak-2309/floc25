import React from 'react';
import { Box, Container, Typography, Grid, Paper } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LinkIcon from '@mui/icons-material/Link';
import PaymentsIcon from '@mui/icons-material/Payments';
import LockIcon from '@mui/icons-material/Lock';

/**
 * Feature item interface
 */
interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
}

/**
 * FeaturesGrid Component
 * 
 * Displays the "For Organizers" section with feature cards in a grid layout.
 */
const FeaturesGrid: React.FC = () => {
    const features: Feature[] = [
        {
            icon: <EditNoteIcon sx={{ fontSize: 32 }} />,
            title: 'Create an Activity',
            description: 'In just a few seconds',
        },
        {
            icon: <LinkIcon sx={{ fontSize: 32 }} />,
            title: 'Share via Link',
            description: 'No app download required',
        },
        {
            icon: <PaymentsIcon sx={{ fontSize: 32 }} />,
            title: 'Collect Payments',
            description: 'Split costs easily',
        },
        {
            icon: <LockIcon sx={{ fontSize: 32 }} />,
            title: 'Privacy Controls',
            description: 'Hide private activities',
        },
    ];

    return (
        <Box
            sx={{
                py: { xs: 8, md: 12 },
                backgroundColor: 'white',
            }}
        >
            <Container maxWidth="lg">
                <Typography
                    variant="h4"
                    sx={{
                        textAlign: 'center',
                        fontWeight: 700,
                        mb: 2,
                        color: '#18181B',
                    }}
                >
                    For Organizers
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        textAlign: 'center',
                        color: '#52525B',
                        mb: 3,
                        maxWidth: 500,
                        mx: 'auto',
                    }}
                >
                    Powerful features to bring friends together. Completely free.
                </Typography>

                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 3,
                                    border: '1px solid #E4E4E7',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    '&:hover': {
                                        borderColor: '#0D9488',
                                        boxShadow: '0 4px 20px rgba(13, 148, 136, 0.1)',
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 2,
                                        backgroundColor: '#99F6E4',
                                        color: '#0D9488',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 2,
                                    }}
                                >
                                    {feature.icon}
                                </Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {feature.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {feature.description}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default FeaturesGrid;
