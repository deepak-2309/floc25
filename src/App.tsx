import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, CircularProgress, Alert } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import PersonIcon from '@mui/icons-material/Person';
import BakeryDiningIcon from '@mui/icons-material/BakeryDining';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { auth } from './firebase/config';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';

// Component imports for different pages/views
import Login from './components/Login';
import LandingPage from './components/LandingPage';
import LegalPage from './components/LegalPage';
import MyActivities from './components/MyActivities';
import FriendsActivities from './components/FriendsActivities';
import Profile from './components/Profile';
import { updateUserData } from './firebase/authUtils';
import ActivityPage from './components/ActivityPage';

// Define all route paths in one place for easy maintenance
const ROUTES = {
  LANDING: '/',
  MY_ACTIVITIES: '/my-plans',
  FRIENDS: '/friends-activities',
  PROFILE: '/profile',
  LOGIN: '/login',
  ACTIVITY: '/activity',
  LEGAL: '/legal'
};

function App() {
  // State for managing authentication and loading status
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Firebase authentication listener
  // This runs when the app starts and monitors auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);

      // Navigation logic based on auth state
      if (currentUser) {
        // Store or update user data in Firestore
        await updateUserData({
          uid: currentUser.uid,
          email: currentUser.email,
        });

        // Only redirect if on login or landing page, but not if on an activity page
        if (window.location.pathname === ROUTES.LOGIN || window.location.pathname === ROUTES.LANDING) {
          // If user is logged in and on login/landing page, redirect to main page
          navigate(ROUTES.MY_ACTIVITIES);
        }
      } else {
        // For unauthenticated users, don't auto-redirect - let them see landing page
        // They can still access activity pages which will prompt login
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  // Handler for user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate(ROUTES.LANDING);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If user is not authenticated, show landing page and login routes
  if (!user) {
    return (
      <Routes>
        <Route path={ROUTES.LANDING} element={<LandingPage />} />
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.LEGAL} element={<LegalPage />} />
        {/* Allow access to activity routes even when not authenticated */}
        <Route path={`${ROUTES.ACTIVITY}/:activityId`} element={
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please log in to view this activity.
            </Alert>
            <Login />
          </Box>
        } />
        <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
      </Routes>
    );
  }

  // Main app layout for authenticated users
  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: '#f5f5f5', // Light gray background for the "desktop" area
      display: 'flex',
      justifyContent: 'center'
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: 480, // Restrict width on larger screens
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'white', // App background
        position: 'relative',
        transform: 'translateZ(0)', // Create containing block for fixed descendants
        boxShadow: { sm: '0 0 20px rgba(0,0,0,0.1)' } // Shadow on desktop
      }}>
        {/* Top App Bar */}
        <AppBar position="sticky" elevation={0} sx={{ top: 0, zIndex: 1100 }}>
          <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                flexGrow: 0,
                fontFamily: 'Pacifico',
                fontWeight: 400,
                letterSpacing: '0.02em',
              }}
            >
              floc
            </Typography>
            {/* Spacer - always present to push sign out to the right */}
            <Box sx={{ flexGrow: 1 }} />

            <Button
              color="inherit"
              onClick={handleLogout}
              size="small"
              sx={{
                fontFamily: 'Pacifico',
                fontWeight: 400,
                fontSize: '1rem',
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Sign Out
            </Button>
          </Toolbar>
        </AppBar>

        {/* Main Content Area */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Routes>
            {/* Redirect root path to My Activities */}
            <Route path="/" element={<Navigate to={ROUTES.MY_ACTIVITIES} replace />} />

            {/* Main application routes */}
            <Route path={ROUTES.MY_ACTIVITIES} element={<MyActivities />} />
            <Route path={ROUTES.FRIENDS} element={<FriendsActivities />} />
            <Route path={ROUTES.PROFILE} element={<Profile />} />

            {/* Route for viewing shared activities */}
            <Route path={`${ROUTES.ACTIVITY}/:activityId`} element={<ActivityPage />} />

            {/* Catch all unknown routes and redirect to My Activities */}
            <Route path="*" element={<Navigate to={ROUTES.MY_ACTIVITIES} replace />} />
          </Routes>
        </Box>

        {/* Bottom Navigation Bar */}
        <BottomNavigation
          value={location.pathname}
          onChange={(_, path) => navigate(path)}
          sx={{ position: 'sticky', bottom: 0, zIndex: 1100 }}
        >
          <BottomNavigationAction
            icon={<CalendarMonthIcon />}
            value={ROUTES.MY_ACTIVITIES}
          />
          <BottomNavigationAction
            icon={<BakeryDiningIcon />}
            value={ROUTES.FRIENDS}
          />
          <BottomNavigationAction
            icon={<PersonIcon />}
            value={ROUTES.PROFILE}
          />
        </BottomNavigation>
      </Box>
    </Box>
  );
}

export default App;