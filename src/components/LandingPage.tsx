import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Typography,
    Grid,
    Paper,
} from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LinkIcon from '@mui/icons-material/Link';
import PaymentsIcon from '@mui/icons-material/Payments';
import LockIcon from '@mui/icons-material/Lock';

/**
 * Custom Squash Ball Icon
 * A black ball with a small yellow dot (like a competition squash ball)
 */
const SquashBallIcon: React.FC = () => (
    <Box
        sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: '#18181B',
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mr: 0.75,
            boxShadow: 'inset -2px -2px 4px rgba(255,255,255,0.1)',
            '&::after': {
                content: '""',
                position: 'absolute',
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: '#FACC15',
                top: 3,
                right: 3,
            },
        }}
    />
);

/**
 * LandingPage Component
 * 
 * A modern, visually stunning landing page for Floc that communicates
 * the core value proposition and drives users to sign up.
 */
const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login');
    };

    // Feature cards data
    const features = [
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
        <Box sx={{ overflowX: 'hidden' }}>
            {/* ============================================ */}
            {/* HERO SECTION */}
            {/* ============================================ */}
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // Modern Mesh Gradient
                    background: 'radial-gradient(at 0% 0%, #115E59 0%, transparent 50%), radial-gradient(at 100% 0%, #0D9488 0%, transparent 50%), radial-gradient(at 50% 100%, #134E4A 0%, transparent 50%), #0F766E',
                    position: 'relative',
                    overflow: 'hidden',
                    // Animated background orbs
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '-30%',
                        right: '-15%',
                        width: '60%',
                        height: '80%',
                        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.2) 0%, transparent 70%)',
                        animation: 'float 8s ease-in-out infinite',
                        pointerEvents: 'none',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '-20%',
                        left: '-10%',
                        width: '50%',
                        height: '70%',
                        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 60%)',
                        animation: 'float 10s ease-in-out infinite reverse',
                        pointerEvents: 'none',
                    },
                    '@keyframes float': {
                        '0%, 100%': { transform: 'translate(0, 0)' },
                        '50%': { transform: 'translate(20px, -20px)' },
                    },
                }}
            >
                <Container maxWidth="lg" sx={{ textAlign: 'center', position: 'relative', zIndex: 1, py: { xs: 10, md: 12 } }}>
                    {/* Logo */}
                    <Typography
                        variant="h2"
                        sx={{
                            fontFamily: 'Pacifico, cursive',
                            fontWeight: 400, // Regular weight
                            color: 'white',
                            mb: 2,
                            fontSize: { xs: '3rem', md: '4rem' },
                            textShadow: '0 2px 20px rgba(0, 0, 0, 0.2)',
                        }}
                    >
                        floc
                    </Typography>

                    {/* Tagline */}
                    <Typography
                        variant="body1"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            mb: 8,
                            fontFamily: 'Pacifico, cursive', // Match "floc" font
                            fontStyle: 'italic',
                            fontWeight: 400, // Pacifico is usually 400
                            letterSpacing: '0.02em',
                            fontSize: { xs: '1.25rem', md: '1.5rem' },
                        }}
                    >
                        hang with your tribe
                    </Typography>

                    {/* Example Activity Cards */}
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 3,
                        mb: 8,
                        maxWidth: 960,
                        mx: 'auto',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 2,
                    }}>
                        {/* Squash Card - Tuesday */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                textAlign: 'left',
                                transition: 'transform 0.2s ease',
                                width: { xs: '100%', sm: 'auto' },
                                maxWidth: { xs: '100%', sm: 280 },
                                flex: { sm: 1 },
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                },
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5, display: 'flex', alignItems: 'center' }}>
                                <SquashBallIcon /> Squash
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', mb: 1 }}>
                                Game Theory Indiranagar
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#0D9488', fontWeight: 500 }}>
                                Tuesday, 7:00 AM
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 2,
                                        backgroundColor: '#FED7AA',
                                        color: '#9A3412',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    ₹250
                                </Box>
                            </Box>
                        </Paper>

                        {/* Ultimate Frisbee Card - Saturday */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                textAlign: 'left',
                                transition: 'transform 0.2s ease',
                                width: { xs: '100%', sm: 'auto' },
                                maxWidth: { xs: '100%', sm: 280 },
                                flex: { sm: 1 },
                                transform: { sm: 'translateY(-24px)' }, // Stagger effect
                                '&:hover': {
                                    transform: { xs: 'translateY(-4px)', sm: 'translateY(-28px)' },
                                },
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}>
                                🥏 Ultimate Frisbee
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', mb: 1 }}>
                                SUFC
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#0D9488', fontWeight: 500 }}>
                                Saturday, 7:00 PM
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 2,
                                        backgroundColor: '#FED7AA',
                                        color: '#9A3412',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    ₹400
                                </Box>
                            </Box>
                        </Paper>

                        {/* Run Card - Sunday */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                background: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                textAlign: 'left',
                                transition: 'transform 0.2s ease',
                                width: { xs: '100%', sm: 'auto' },
                                maxWidth: { xs: '100%', sm: 280 },
                                flex: { sm: 1 },
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                },
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}>
                                🏃‍♂️ Morning Run
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', mb: 1 }}>
                                Cubbon Park
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#0D9488', fontWeight: 500 }}>
                                Sunday, 6:00 AM
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box
                                    sx={{
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 2,
                                        backgroundColor: '#99F6E4',
                                        color: '#0F766E',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                    }}
                                >
                                    Free
                                </Box>
                            </Box>
                        </Paper>
                    </Box>

                    {/* CTA Button */}
                    <Button
                        variant="contained"
                        size="large"
                        onClick={handleGetStarted}
                        sx={{
                            px: 6,
                            py: 2,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            backgroundColor: '#F97316',
                            color: 'white',
                            borderRadius: 3,
                            boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: '#EA580C',
                                transform: 'translateY(-3px)',
                                boxShadow: '0 8px 30px rgba(249, 115, 22, 0.5)',
                            },
                        }}
                    >
                        Get Started
                    </Button>

                </Container>
            </Box>

            {/* ============================================ */}
            {/* FEATURES SECTION */}
            {/* ============================================ */}
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

            {/* ============================================ */}
            {/* FOOTER */}
            {/* ============================================ */}
            <Box
                sx={{
                    py: 4,
                    backgroundColor: '#18181B',
                    textAlign: 'center',
                }}
            >
                <Typography
                    sx={{
                        fontFamily: 'Pacifico, cursive',
                        color: 'white',
                        fontSize: '1.5rem',
                        mb: 1,
                    }}
                >
                    floc
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Typography
                        variant="body2"
                        onClick={() => navigate('/legal')}
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            cursor: 'pointer',
                            transition: 'color 0.2s ease',
                            '&:hover': {
                                color: 'white',
                            },
                        }}
                    >
                        Privacy Policy & Terms of Use
                    </Typography>
                </Box>
                <Typography
                    variant="body2"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.5)',
                    }}
                >
                    © {new Date().getFullYear()} Floc. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
};

export default LandingPage;
