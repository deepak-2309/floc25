import { createTheme, alpha } from '@mui/material/styles';

// Material Design 3 Color Tokens
const m3Colors = {
  // Primary - Vibrant Teal
  primary: {
    main: '#0D9488',
    light: '#14B8A6',
    dark: '#0F766E',
    container: '#99F6E4',
    onContainer: '#134E4A',
  },
  // Secondary - Warm Coral
  secondary: {
    main: '#F97316',
    light: '#FB923C',
    dark: '#EA580C',
    container: '#FED7AA',
    onContainer: '#7C2D12',
  },
  // Tertiary - Soft Violet
  tertiary: {
    main: '#8B5CF6',
    light: '#A78BFA',
    dark: '#7C3AED',
  },
  // Neutral surfaces
  surface: {
    main: '#FAFAFA',
    variant: '#F4F4F5',
    container: '#FFFFFF',
  },
  // Error
  error: {
    main: '#DC2626',
    light: '#EF4444',
    dark: '#B91C1C',
  },
  // Text
  text: {
    primary: '#18181B',
    secondary: '#52525B',
    disabled: '#A1A1AA',
  },
  // Outline
  outline: '#E4E4E7',
  outlineVariant: '#D4D4D8',
};

const theme = createTheme({
  palette: {
    primary: {
      main: m3Colors.primary.main,
      light: m3Colors.primary.light,
      dark: m3Colors.primary.dark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: m3Colors.secondary.main,
      light: m3Colors.secondary.light,
      dark: m3Colors.secondary.dark,
      contrastText: '#FFFFFF',
    },
    error: {
      main: m3Colors.error.main,
      light: m3Colors.error.light,
      dark: m3Colors.error.dark,
    },
    background: {
      default: m3Colors.surface.main,
      paper: m3Colors.surface.container,
    },
    text: {
      primary: m3Colors.text.primary,
      secondary: m3Colors.text.secondary,
      disabled: m3Colors.text.disabled,
    },
    divider: m3Colors.outline,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
    },
    subtitle1: {
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    // App Bar - Modern Glassmorphism
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Translucent White
          backdropFilter: 'blur(20px)', // Frosted glass effect
          color: m3Colors.primary.main, // Teal text to pop on white
          boxShadow: 'none',
          borderBottom: `1px solid ${alpha(m3Colors.outline, 0.2)}`,
          backgroundImage: 'none', // Remove old gradient
        },
      },
    },
    // Bottom Navigation - Modern Glassmorphism
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          position: 'fixed',
          bottom: 0,
          width: '100%',
          height: 80, // Taller for better touch targets
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${alpha(m3Colors.outline, 0.2)}`,
          boxShadow: 'none', // Remove old shadow
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          padding: '12px',
          minWidth: 64,
          color: alpha(m3Colors.text.secondary, 0.6), // Subtle inactive state
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            color: m3Colors.primary.main,
            transform: 'scale(1.1)', // Subtle grow on selection
            '& .MuiSvgIcon-root': {
              filter: 'drop-shadow(0 4px 6px rgba(13, 148, 136, 0.2))', // Glow effect
            }
          },
        },
      },
    },
    // Cards - Soft Floating Modern
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24, // Super rounded
          boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0,0,0,0.1)', // Diffused soft shadow
          border: 'none', // Remove heavy borders
          backgroundColor: 'white',
          transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease', // Bouncy transition
          '&:hover': {
            transform: 'translateY(-4px) scale(1.01)',
            boxShadow: '0 12px 30px -8px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0,0,0,0.1)',
          },
          '&:active': {
            transform: 'scale(0.98)',
            boxShadow: '0 2px 10px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          '&:last-child': {
            paddingBottom: 24,
          },
        },
      },
    },
    // Paper - Soft shadows everywhere
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.05)',
        },
        elevation3: {
          boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    // Buttons - Modern tactile
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 100, // Pill shaped mostly
          padding: '12px 28px',
          fontWeight: 600,
          fontSize: '0.95rem',
          letterSpacing: '-0.01em',
          boxShadow: 'none',
          textTransform: 'none', // Ensure mixed case
          transition: 'all 0.15s ease',
          '&:active': {
            transform: 'scale(0.96)',
          },
        },
        contained: {
          boxShadow: '0 4px 12px rgba(13, 148, 136, 0.2)', // Colored shadow
          '&:hover': {
            boxShadow: '0 6px 16px rgba(13, 148, 136, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        containedPrimary: {
          // Flat vibrant color is very modern.
          background: '#0D9488',
          '&:hover': {
            background: '#0F766E',
          },
        },
      },
    },
    // FAB - Floating pill
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 20px rgba(13, 148, 136, 0.3)',
          '&:active': {
            transform: 'scale(0.94)',
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Squircle
          fontWeight: 600,
        },
      },
    },
    // Drawer - Global Desktop Constraint
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          boxShadow: '0 -4px 30px rgba(0,0,0,0.1)',
        },
        // Anchor existing logic for desktop width
        paperAnchorBottom: {
          maxWidth: '480px',
          width: '100%',
          margin: '0 auto',
          left: 0,
          right: 0,
        }
      },
    },
  },
});

export default theme; 