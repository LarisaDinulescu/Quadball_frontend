import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  Link 
} from 'react-router-dom';
import { Box, Container, Typography, Paper, Divider, AppBar, Toolbar, Button } from '@mui/material';

// Importing your components
import Home from './components/Home'; 
import Login from './components/Login'; 
import Register from './components/Register'; 
import Profile from './components/Profile';
import PlayerManagement from './components/players/PlayerManagement'; 
import Tournaments from './components/Tournaments'; 
import TeamsPage from './components/teams/TeamsPage';
import ResetPassword from './components/ResetPassword';
import CreateTournament from './components/CreateTournament';

function App() {
  const [user, setUser] = useState(null);

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

  // --- INTERNAL NAVBAR COMPONENT ---
  const GlobalNavbar = () => {
    const navigate = useNavigate();
    return (
      <AppBar position="static" color="primary" elevation={4}>
        <Toolbar>
          <Typography 
            variant="h6" 
            sx={{ flexGrow: 1, fontWeight: 'bold', cursor: 'pointer' }} 
            onClick={() => navigate('/')}
          >
            QUADBALLHOLIC
          </Typography>
          
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/teams">Teams</Button>
          <Button color="inherit" component={Link} to="/stadiums">Stadiums</Button>
          <Button color="inherit" component={Link} to="/tournaments">Tournaments</Button>
          <Button color="inherit" component={Link} to="/live">Live</Button>

          {user ? (
            <>
              {/* Only visible to Organization Managers */}
              {user.role === 'ROLE_ORGANIZATION_MANAGER' && (
                <Button color="inherit" component={Link} to="/dashboard/players">Players</Button>
              )}
              
              <Button color="inherit" component={Link} to="/dashboard">Profile</Button>
              
              <Typography variant="body2" sx={{ ml: 2, mr: 2, fontStyle: 'italic', borderLeft: '1px solid white', pl: 2 }}>
                {user.email}
              </Typography>
              
              <Button variant="outlined" color="inherit" onClick={handleLogout} sx={{ borderColor: 'rgba(255,255,255,0.5)' }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">Login</Button>
              <Button variant="outlined" color="inherit" component={Link} to="/register" sx={{ ml: 1, borderColor: 'rgba(255,255,255,0.5)' }}>
                Register
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
    );
  };

  return (
    <Router>
      <Box sx={{ flexGrow: 1, backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
        <GlobalNavbar /> 

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route 
            path="/login" 
            element={!user ? <Login onLoginSuccess={(userData) => setUser(userData)} /> : <Navigate replace to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register onRegisterSuccess={(userData) => setUser(userData)} /> : <Navigate replace to="/dashboard" />} 
          />

          {/* Protected Route: Dashboard (All logged-in users) */}
          <Route 
            path="/dashboard" 
            element={user ? <DashboardHome user={user} /> : <Navigate replace to="/login" />} 
          />

          <Route path="/teams" element={<TeamsPage />} />

          <Route 
            path="/tournaments/create" 
            element={
              user?.role === 'ROLE_ORGANIZATION_MANAGER' 
                ? <CreateTournament /> 
                : <Navigate replace to="/tournaments" />
            } 
          />


          {/* Protected Route: Player Management (Managers only) */}
          <Route 
            path="/dashboard/players" 
            element={
              user?.role === 'ROLE_ORGANIZATION_MANAGER' 
                ? <PlayerManagementWrapper /> 
                : <Navigate replace to="/dashboard" />
            } 
          />

          {/* Protected Route: Create Tournament (Managers only) */}
          <Route 
            path="/tournaments/create" 
            element={
              user?.role === 'ROLE_ORGANIZATION_MANAGER' 
                ? <div className="p-10 text-center font-bold">Create Tournament Form (Coming Soon)</div> 
                : <Navigate replace to="/tournaments" />
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>
    </Router>
  );
}

// --- SUPPORT COMPONENTS ---

function DashboardHome({ user }) {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>Dashboard</Typography>
        <Typography>Welcome back, <strong>{user.name}</strong>!</Typography>
        <Typography variant="body2" color="textSecondary">Role: {user.role}</Typography>
      </Paper>
      <Divider sx={{ my: 4 }}>YOUR PROFILE</Divider>
      <Profile user={user} />
    </Container>
  );
}

function PlayerManagementWrapper() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>Players Management</Typography>
      <PlayerManagement />
    </Container>
  );
}

export default App;