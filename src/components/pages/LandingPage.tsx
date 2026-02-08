import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { HeroSection, FeaturesGrid, Footer } from '../landing';

/**
 * LandingPage Component
 * 
 * A modern, visually stunning landing page for Floc that communicates
 * the core value proposition and drives users to sign up.
 * 
 * This component composes sub-components for better maintainability:
 * - HeroSection: Logo, tagline, activity cards, CTA
 * - FeaturesGrid: "For Organizers" feature cards
 * - Footer: Logo, legal links, copyright
 */
const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate('/login');
    };

    return (
        <Box sx={{ overflowX: 'hidden' }}>
            <HeroSection onGetStarted={handleGetStarted} />
            <FeaturesGrid />
            <Footer />
        </Box>
    );
};

export default LandingPage;
