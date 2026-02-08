import React from 'react';
import { Box } from '@mui/material';

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

export default SquashBallIcon;
