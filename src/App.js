import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Paper, Button, Divider } from '@mui/material';
import Login from './components/Login'; 
import Register from './components/Register'; 
import Profile from './components/Profile';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false); // State to toggle between Login and Register

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      try {
        setUser(JSON.parse(loggedInUser));
      } catch (error) {
        console.error("Error loading user data", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  // Authentication logic: if no user is logged in, show Login or Register
  if (!user) {
    if (showRegister) {
      return (
        <Register 
          onRegisterSuccess={(userData) => setUser(userData)} 
          onSwitchToLogin={() => setShowRegister(false)} 
        />
      );
    }
    return (
      <Login 
        onLoginSuccess={(userData) => setUser(userData)} 
        onSwitchToRegister={() => setShowRegister(true)} 
      />
    );
  }

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <AppBar position="static" color="primary" elevation={4}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            QUADBALLHOLIC MANAGEMENT
          </Typography>
          
          <Button color="inherit">Players</Button>
          <Button color="inherit">Teams</Button>
          
          <Typography variant="body2" sx={{ ml: 2, mr: 2, fontStyle: 'italic', borderLeft: '1px solid white', pl: 2 }}>
            {user.email}
          </Typography>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleLogout}
            sx={{ border: '1px solid rgba(255,255,255,0.5)', color: 'white' }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Dashboard Section */}
        <Paper sx={{ p: 3, mb: 4, backgroundColor: '#ffffff', borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
            Dashboard
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 2 }}>
            Welcome, <strong>{user.name} {user.surname}</strong>!
          </Typography>

          <Box sx={{ mt: 3, p: 2, bgcolor: '#f9f9f9', borderRadius: 1, borderLeft: '5px solid #ffab00' }}>
            <Typography variant="body2" component="div">
              Current Role: <strong>{user.role}</strong>
            </Typography>
          </Box>
        </Paper>

        <Divider sx={{ my: 4 }}>YOUR PROFILE</Divider>

        {/* Passing the user object (Name, Surname, Age) to the Profile component */}
        <Profile user={user} />
        
      </Container>
    </Box>
  );
}

export default App;
