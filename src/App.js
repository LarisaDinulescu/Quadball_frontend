import React, { useState, useEffect } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useNavigate,
    Link
} from 'react-router-dom';
import { Box, Container, Typography, Paper, Divider, AppBar, Toolbar, Button, CircularProgress } from '@mui/material';

// Importing your components
import Home from './components/Home';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import PlayerManagement from './components/players/PlayerManagement';
import PlayerForm from "./components/players/PlayerForm";
import OfficialManagement from './components/matchOfficial/OfficialManagement';
import LiveMatch from './components/live/LiveMatch';
import MatchDetail from './components/live/MatchDetail';
import Tournaments from './components/tournaments/Tournaments';
import AssignTeams from './components/tournaments/AssignTeams';
import MatchReservation from './components/booking/MatchReservation';
import CreateTournament from './components/tournaments/CreateTournament';
import MatchEditor from './components/tournaments/MatchEditor';
import TeamsPage from "./components/teams/TeamsPage";
import TeamDetail from "./components/teams/TeamDetail";
import CreateTeam from "./components/teams/CreateTeam";
import StadiumPage from "./components/stadiums/StadiumManagement";
import CreateStadium from "./components/stadiums/StadiumForm";
import AdminReservations from './components/booking/AdminReservations';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import MatchForm from './components/matches/MatchForm';
import MatchManagement from './components/matches/MatchManagement';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Added to handle initial loading

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (loggedInUser) {
            try {
                setUser(JSON.parse(loggedInUser));
            } catch (error) {
                console.error("Error loading user data", error);
                localStorage.removeItem('user'); // Cleans up if the JSON is corrupted
            }
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    const hasRequiredRole = (requiredRole) => {
        if (!user || !user.roles) return false;
        const rolesToCheck = Array.isArray(user.roles) ? user.roles : [user.roles];

        return rolesToCheck.some(r => {
            if (!r) return false;
            const rName = typeof r === 'object' ? (r.roleName || r.authority || r.name) : r;
            return rName === requiredRole;
        });
    };

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
                    <Button color="inherit" component={Link} to="/players">Players</Button>
                    <Button color="inherit" component={Link} to="/officials">Officials</Button>
                    <Button color="inherit" component={Link} to="/stadiums">Stadiums</Button>
                    <Button color="inherit" component={Link} to="/matches">Matches</Button>
                    <Button color="inherit" component={Link} to="/tournaments">Tournaments</Button>
                    <Button color="inherit" component={Link} to="/live">Live</Button>

                    {user ? (
                        <>
                            <Button color="inherit" component={Link} to="/dashboard">Profile</Button>
                            <Typography variant="body2" sx={{ ml: 2, mr: 2, fontStyle: 'italic', borderLeft: '1px solid white', pl: 2 }}>
                                {user?.email}
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

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Router>
            <Box sx={{ flexGrow: 1, backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
                <GlobalNavbar />

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/tournaments" element={<Tournaments />} />
                    <Route path="/live" element={<LiveMatch />} />
                    <Route path="/live/:id" element={<MatchDetail />} />
                    <Route path="/teams" element={<TeamsPage />} />
                    <Route path="/teams/:id" element={<TeamDetail />} />
                    <Route path="/players" element={<PlayerManagement />} />
                    <Route path="/officials" element={<OfficialManagement />} />
                    <Route path="/stadiums" element={<StadiumPage />} />
                    <Route path="/matches" element={<MatchManagement />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/activate-account" element={<ResetPassword />} />

                    <Route
                        path="/login"
                        element={!user ? <Login onLoginSuccess={(userData) => setUser(userData)} /> : <Navigate replace to="/dashboard" />}
                    />
                    <Route
                        path="/register"
                        element={!user ? <Register onRegisterSuccess={(userData) => setUser(userData)} /> : <Navigate replace to="/dashboard" />}
                    />

                    <Route
                        path="/dashboard"
                        element={user ? <DashboardHome user={user} /> : <Navigate replace to="/login" />}
                    />

                    <Route
                        path="/reservation"
                        element={user ? <MatchReservation /> : <Navigate replace to="/login" />}
                    />

                    {/* Admin / Manager Routes */}
                    <Route
                        path="/admin/reservations"
                        element={hasRequiredRole('ROLE_ORGANIZATION_MANAGER') ? <AdminReservations /> : <Navigate to="/dashboard" replace />}
                    />

                    <Route
                        path="/stadiums/create"
                        element={hasRequiredRole('ROLE_ORGANIZATION_MANAGER') ? <Container maxWidth="sm" sx={{ mt: 8 }}><CreateStadium /></Container> : <Navigate replace to="/stadiums" />}
                    />

                    <Route
                        path="/player/create"
                        element={hasRequiredRole('ROLE_ORGANIZATION_MANAGER') ? <Container maxWidth="sm" sx={{ mt: 8 }}><PlayerForm /></Container> : <Navigate replace to="/players" />}
                    />

                    <Route
                        path="/official/create"
                        element={hasRequiredRole('ROLE_ORGANIZATION_MANAGER') ? <Container maxWidth="sm" sx={{ mt: 8 }}><PlayerForm /></Container> : <Navigate replace to="/officials" />}
                    />

                    <Route
                        path="/matches/create"
                        element={hasRequiredRole('ROLE_ORGANIZATION_MANAGER') ? <Container maxWidth="sm" sx={{ mt: 8 }}><MatchForm /></Container> : <Navigate replace to="/matches" />}
                    />

                    <Route
                        path="/tournaments/match/:matchId/edit"
                        element={hasRequiredRole('ROLE_ORGANIZATION_MANAGER') ? <MatchEditor /> : <Navigate to="/tournaments" />}
                    />

                    <Route
                        path="/teams/create"
                        element={hasRequiredRole('ROLE_ORGANIZATION_MANAGER') ? <CreateTeam /> : <Navigate replace to="/teams" />}
                    />

                    <Route
                        path="/teams/edit/:id"
                        element={hasRequiredRole('ROLE_ORGANIZATION_MANAGER') || hasRequiredRole('ROLE_TEAM_MANAGER') ? <CreateTeam /> : <Navigate replace to="/teams" />}
                    />

                    <Route
                        path="/tournaments/:tournamentId/match/:matchId/assign"
                        element={hasRequiredRole('ROLE_ORGANIZATION_MANAGER') ? <AssignTeams /> : <Navigate to="/tournaments" replace />}
                    />

                    <Route
                        path="/tournaments/create"
                        element={hasRequiredRole('ROLE_ORGANIZATION_MANAGER') ? <CreateTournament /> : <Navigate replace to="/tournaments" />}
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Box>
        </Router>
    );
}

// --- SUPPORT COMPONENTS ---

function DashboardHome({ user }) {
    const getRoleLabel = () => {
        if (!user?.roles || user.roles.length === 0) return 'User';
        const roleObj = user.roles[0];
        const roleString = typeof roleObj === 'object' ? (roleObj.roleName || roleObj.authority) : roleObj;
        return roleString ? roleString.replace('ROLE_', '').replace(/_/g, ' ') : 'User';
    };

    // Fallback if user is lost during rendering
    if (!user) return null;

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>Dashboard</Typography>
                <Typography>Welcome back, <strong>{user?.name || 'User'}</strong>!</Typography>

                <Typography variant="body2" color="textSecondary">
                    Role: <strong>{getRoleLabel()}</strong>
                </Typography>
            </Paper>
            <Divider sx={{ my: 4 }}>YOUR PROFILE</Divider>
            {/* Extra protection for the Profile component */}
            {user && <Profile user={user} />}
        </Container>
    );
}

export default App;