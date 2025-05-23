import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Button, CircularProgress, Alert } from '@mui/material';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import LocalActivityIcon from '@mui/icons-material/LocalActivity';
import { auth } from './firebase/config';
import { signOut, onAuthStateChanged, User } from 'firebase/auth';
import theme from './theme';

// Component imports for different pages/views
import Login from './components/Login';
import MyActivities from './components/MyActivities';
import FriendsActivities from './components/FriendsActivities';
import Profile from './components/Profile';
import { updateUserData } from './firebase/authUtils';
import ActivityPage from './components/ActivityPage';

// Define all route paths in one place for easy maintenance
const ROUTES = {
  MY_ACTIVITIES: '/my-plans',
  FRIENDS: '/friends-activities',
  PROFILE: '/profile',
  LOGIN: '/login',
  ACTIVITY: '/activity'
};

function App() {
  // State for managing authentication and loading status
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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

        // Only redirect if on login page, but not if on an activity page
        if (window.location.pathname === ROUTES.LOGIN) {
          // If user is logged in and on login page, redirect to main page
          navigate(ROUTES.MY_ACTIVITIES);
        }
      } else {
        // If no user is logged in and not on an activity page, redirect to login
        // Allow staying on activity pages for login prompt
        if (!window.location.pathname.startsWith(ROUTES.ACTIVITY)) {
          navigate(ROUTES.LOGIN);
        }
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  // Handler for user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate(ROUTES.LOGIN);
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

  // If user is not authenticated, show login routes only
  if (!user) {
    return (
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        {/* Allow access to activity routes even when not authenticated */}
        <Route path={`${ROUTES.ACTIVITY}/:activityId`} element={
          <Box sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Please log in to view this activity.
            </Alert>
            <Login />
          </Box>
        } />
        <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
    );
  }

  // Main app layout for authenticated users
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 0, fontFamily: 'Pacifico' }}>
            floc
          </Typography>
          <Typography 
            variant="body1" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontStyle: 'italic',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: 'Pacifico'
            }}
          >
            join your friends, irl!
          </Typography>
          <Button color="inherit" onClick={handleLogout} sx={{ textTransform: 'none' }}>
            sign out
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
        // Current value is based on the current URL path
        value={window.location.pathname}
        // Navigate when a tab is selected
        onChange={(_, path) => navigate(path)}
        sx={{
          borderTop: '1px solid rgba(0, 0, 0, 0.12)',
          bgcolor: 'background.paper'
        }}
      >
        <BottomNavigationAction
          label="My Plans"
          icon={<LocalActivityIcon />}
          value={ROUTES.MY_ACTIVITIES}
        />
        <BottomNavigationAction
          label="Friends"
          icon={<PeopleIcon />}
          value={ROUTES.FRIENDS}
        />
        <BottomNavigationAction
          label="Profile"
          icon={<PersonIcon />}
          value={ROUTES.PROFILE}
        />
      </BottomNavigation>
    </Box>
  );
}

export default App; 