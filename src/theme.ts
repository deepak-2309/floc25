import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#A06B89',
      light: '#B589A3',
      dark: '#8A5873',
    },
    secondary: {
      main: '#A06B89',
    },
  },
  components: {
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          position: 'fixed',
          bottom: 0,
          width: '100%',
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
});

export default theme; 