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
    // App Bar - M3 surface styling
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: m3Colors.primary.main,
          backgroundImage: `linear-gradient(135deg, ${m3Colors.primary.main} 0%, ${m3Colors.primary.dark} 100%)`,
          boxShadow: `0 2px 8px ${alpha(m3Colors.primary.dark, 0.25)}`,
        },
      },
    },
    // Bottom Navigation - M3 styling
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          position: 'fixed',
          bottom: 0,
          width: '100%',
          height: 72,
          backgroundColor: m3Colors.surface.container,
          borderTop: `1px solid ${m3Colors.outline}`,
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          padding: '8px 12px 12px',
          minWidth: 80,
          color: m3Colors.text.secondary,
          '&.Mui-selected': {
            color: m3Colors.primary.main,
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            fontWeight: 500,
            marginTop: 4,
            '&.Mui-selected': {
              fontSize: '0.75rem',
              fontWeight: 600,
            },
          },
        },
      },
    },
    // Cards - M3 elevated style
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          border: `1px solid ${m3Colors.outline}`,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 20,
          '&:last-child': {
            paddingBottom: 20,
          },
        },
      },
    },
    // Paper - softer shadows
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        },
        elevation3: {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    // Buttons - M3 filled tonal style
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: `0 4px 12px ${alpha(m3Colors.primary.main, 0.3)}`,
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${m3Colors.primary.main} 0%, ${m3Colors.primary.dark} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${m3Colors.primary.light} 0%, ${m3Colors.primary.main} 100%)`,
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: alpha(m3Colors.primary.main, 0.04),
          },
        },
        outlinedPrimary: {
          borderColor: m3Colors.primary.main,
        },
      },
    },
    // FAB - M3 styling
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: `0 4px 16px ${alpha(m3Colors.primary.main, 0.3)}`,
          '&:hover': {
            boxShadow: `0 6px 20px ${alpha(m3Colors.primary.main, 0.4)}`,
          },
        },
        primary: {
          background: `linear-gradient(135deg, ${m3Colors.primary.main} 0%, ${m3Colors.primary.dark} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${m3Colors.primary.light} 0%, ${m3Colors.primary.main} 100%)`,
          },
        },
      },
    },
    // Chips - M3 styling
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        colorPrimary: {
          backgroundColor: m3Colors.primary.container,
          color: m3Colors.primary.onContainer,
        },
      },
    },
    // Text Fields - M3 outlined style
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '& fieldset': {
              borderColor: m3Colors.outlineVariant,
              borderWidth: 2,
            },
            '&:hover fieldset': {
              borderColor: m3Colors.primary.light,
            },
            '&.Mui-focused fieldset': {
              borderColor: m3Colors.primary.main,
            },
          },
        },
      },
    },
    // Alerts - rounded
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    // Snackbar
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: m3Colors.text.primary,
        },
      },
    },
    // Icon Buttons
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s ease, transform 0.2s ease',
          '&:hover': {
            backgroundColor: alpha(m3Colors.primary.main, 0.08),
          },
        },
      },
    },
    // Tooltip
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: m3Colors.text.primary,
          fontSize: '0.75rem',
          padding: '8px 12px',
        },
      },
    },
    // Drawer - Global Desktop Constraint for Bottom Sheets
    // This ensures all bottom sheets (Create, Edit, etc.) adhere to the 480px app width
    // regardless of where they are in the component tree.
    MuiDrawer: {
      styleOverrides: {
        paper: {
          // Target bottom-anchored drawers specifically using the standard class
          '&.MuiDrawer-paperAnchorBottom': {
            maxWidth: '480px',
            width: '100%', // Ensure it fills space up to maxWidth
            margin: '0 auto', // Center horizontally
            left: 0,
            right: 0, // Force detailed positioning for margin: auto to work
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
        },
      },
    },
  },
});

export default theme; 