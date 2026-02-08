import React from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * Footer Component
 * 
 * The landing page footer with logo, legal links, and copyright.
 */
const Footer: React.FC = () => {
    const navigate = useNavigate();

    return (
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
    );
};

export default Footer;
