import React, { useRef, useEffect } from 'react';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import SquashBallIcon from './SquashBallIcon';

interface HeroSectionProps {
    onGetStarted: () => void;
}

/**
 * HeroSection Component
 * 
 * The main hero section of the landing page with animated background,
 * logo, tagline, example activity cards carousel, and CTA button.
 */
const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted }) => {
    const carouselRef = useRef<HTMLDivElement>(null);

    // Check if mobile viewport
    const isMobile = () => window.innerWidth < 600;

    // Scroll to center card on mount (mobile only)
    useEffect(() => {
        if (carouselRef.current && isMobile()) {
            const container = carouselRef.current;
            const cards = container.children;
            if (cards.length >= 3) {
                const centerCard = cards[1] as HTMLElement;
                const scrollPosition = centerCard.offsetLeft - (container.offsetWidth - centerCard.offsetWidth) / 2;
                container.scrollLeft = scrollPosition;
            }
        }
    }, []);

    // Shared card styles
    const cardBaseSx = {
        p: 3,
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        textAlign: 'left' as const,
        transition: 'transform 0.2s ease',
        flex: { xs: '0 0 85%', sm: 1 },
        minWidth: { xs: '85%', sm: 'auto' },
        maxWidth: { xs: '85%', sm: 280 },
        scrollSnapAlign: { xs: 'center', sm: 'unset' },
    };

    const priceBadgeSx = (isPaid: boolean) => ({
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        backgroundColor: isPaid ? '#FED7AA' : '#99F6E4',
        color: isPaid ? '#9A3412' : '#0F766E',
        fontSize: '0.75rem',
        fontWeight: 600,
    });

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(at 0% 0%, #115E59 0%, transparent 50%), radial-gradient(at 100% 0%, #0D9488 0%, transparent 50%), radial-gradient(at 50% 100%, #134E4A 0%, transparent 50%), #0F766E',
                position: 'relative',
                overflow: 'hidden',
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
                        fontWeight: 400,
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
                        fontFamily: 'Pacifico, cursive',
                        fontStyle: 'italic',
                        fontWeight: 400,
                        letterSpacing: '0.02em',
                        fontSize: { xs: '1.25rem', md: '1.5rem' },
                    }}
                >
                    hang with your tribe
                </Typography>

                {/* Example Activity Cards Carousel */}
                <Box
                    ref={carouselRef}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 3,
                        mb: 8,
                        maxWidth: { xs: '100%', sm: 960 },
                        mx: 'auto',
                        alignItems: { xs: 'stretch', sm: 'center' },
                        justifyContent: { xs: 'flex-start', sm: 'center' },
                        px: { xs: 3, sm: 2 },
                        overflowX: { xs: 'auto', sm: 'visible' },
                        scrollSnapType: { xs: 'x mandatory', sm: 'none' },
                        WebkitOverflowScrolling: 'touch',
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {/* Squash Card */}
                    <Paper elevation={0} sx={{ ...cardBaseSx, '&:hover': { transform: 'translateY(-4px)' } }}>
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
                            <Box sx={priceBadgeSx(true)}>₹250</Box>
                        </Box>
                    </Paper>

                    {/* Ultimate Frisbee Card */}
                    <Paper
                        elevation={0}
                        sx={{
                            ...cardBaseSx,
                            transform: { xs: 'none', sm: 'translateY(-24px)' },
                            '&:hover': { transform: { xs: 'translateY(-4px)', sm: 'translateY(-28px)' } },
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
                            <Box sx={priceBadgeSx(true)}>₹400</Box>
                        </Box>
                    </Paper>

                    {/* Run Card */}
                    <Paper elevation={0} sx={{ ...cardBaseSx, '&:hover': { transform: 'translateY(-4px)' } }}>
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
                            <Box sx={priceBadgeSx(false)}>Free</Box>
                        </Box>
                    </Paper>
                </Box>

                {/* CTA Button */}
                <Button
                    variant="contained"
                    size="large"
                    onClick={onGetStarted}
                    sx={{
                        px: 6,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        backgroundColor: '#FB923C',
                        color: 'white',
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(251, 146, 60, 0.4)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: '#F97316',
                            transform: 'translateY(-3px)',
                            boxShadow: '0 8px 30px rgba(251, 146, 60, 0.5)',
                        },
                    }}
                >
                    Get Started
                </Button>
            </Container>
        </Box>
    );
};

export default HeroSection;
