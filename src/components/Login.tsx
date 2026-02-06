import React, { useState } from 'react';
import { Box, Button, Container, Paper, Typography, CircularProgress } from '@mui/material';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import GoogleIcon from '@mui/icons-material/Google';

function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError('Failed to sign in. Please try again.');
      console.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 50%, #134E4A 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '70%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-30%',
          left: '-10%',
          width: '50%',
          height: '80%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 60%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 5 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
            mx: 'auto',
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }}
        >

          {/* App Title */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontFamily: 'Pacifico, cursive',
              color: '#0D9488',
              mb: 6,
            }}
          >
            floc
          </Typography>


          {/* Error message */}
          {error && (
            <Typography
              color="error"
              sx={{
                mb: 2,
                textAlign: 'center',
                fontSize: '0.875rem',
              }}
            >
              {error}
            </Typography>
          )}

          {/* Google Sign In Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <GoogleIcon />}
            fullWidth
            sx={{
              py: 1.5,
              backgroundColor: '#FFFFFF',
              color: '#3C4043',
              border: '1px solid #DADCE0',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              '&:hover': {
                backgroundColor: '#F8F9FA',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-1px)',
              },
              '& .MuiButton-startIcon': {
                mr: 1.5,
              },
            }}
          >
            {isLoading ? 'Signing in...' : 'Continue with Google'}
          </Button>

          {/* Footer text */}

        </Paper>
      </Container>
    </Box>
  );
}

export default Login; 