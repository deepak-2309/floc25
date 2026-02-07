import React, { useState } from 'react';
import { Box, Typography, Paper, IconButton, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface CollapsibleSectionProps {
    title: string;
    count?: number;
    children: React.ReactNode;
    defaultExpanded?: boolean;
    className?: string;
}

/**
 * A reusable component that renders a section with a header, count, and collapsible content.
 * Used in profile views to display lists like Connections and Activities.
 */
const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    count,
    children,
    defaultExpanded = false
}) => {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                mb: 3,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: expanded ? 1 : 0,
                    cursor: 'pointer'
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <Typography variant="h6">
                    {title} {count !== undefined && `(${count})`}
                </Typography>
                <IconButton
                    size="small"
                    aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
                >
                    {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
            </Box>
            <Collapse in={expanded}>
                {children}
            </Collapse>
        </Paper>
    );
};

export default CollapsibleSection;
