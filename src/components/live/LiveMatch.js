import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Grid, Paper, Avatar } from '@mui/material';

// --- HELPER: TIME CALCULATOR ---
const calculateElapsedTime = (startTimeStr, status) => {
    if (!startTimeStr) return "00:00";
    if (status === 'SCHEDULED') return "UPCOMING";
    if (status === 'FINISHED') return "FT";

    const start = new Date(startTimeStr).getTime();
    const now = new Date().getTime();

    if (now < start) return "00:00";

    const diffMs = now - start;
    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const fmtMin = minutes < 10 ? `0${minutes}` : minutes;
    const fmtSec = seconds < 10 ? `0${seconds}` : seconds;

    return `${fmtMin}:${fmtSec}`;
};

// --- MOCK DATA (WITH REAL SCHEDULES) ---
// We create dates relative to NOW so the timer works immediately for demo
const INITIAL_MATCHES = [
    {
        id: 1,
        homeTeam: "Milano Gators",
        awayTeam: "Roma Centurions",
        homeScore: 10,
        awayScore: 10,
        // Started 15 minutes and 30 seconds ago
        schedule: new Date(Date.now() - (15 * 60 * 1000) - (30 * 1000)).toISOString(),
        time: "00:00", // Will be calculated immediately
        period: "1st Half",
        stadium: "Arena Civica, Milano",
        status: "IN_PROGRESS",
        lastEvent: "Goal by Milano! (+10 pts)",
        eventType: "goal"
    },
    {
        id: 2,
        homeTeam: "Venezia Krakens",
        awayTeam: "Firenze Lilies",
        homeScore: 30,
        awayScore: 10,
        // Started 45 minutes ago
        schedule: new Date(Date.now() - (45 * 60 * 1000)).toISOString(),
        time: "00:00",
        period: "2nd Half",
        stadium: "Stadio Penzo, Venezia",
        status: "IN_PROGRESS",
        lastEvent: "Snitch caught by Seeker!",
        eventType: "snitch"
    },
    {
        id: 3,
        homeTeam: "Torino Minotaurs",
        awayTeam: "Bologna Hippogriffs",
        homeScore: 0,
        awayScore: 0,
        // Starts in 1 hour (Future)
        schedule: new Date(Date.now() + (60 * 60 * 1000)).toISOString(),
        time: "UPCOMING",
        period: "-",
        stadium: "Parco del Valentino, Torino",
        status: "SCHEDULED",
        lastEvent: "Match not started",
        eventType: "info"
    }
];

const getEventStyle = (type) => {
    const safeType = type ? type.toLowerCase() : 'info';
    switch (safeType) {
        case 'goal': return { bg: '#e8f5e9', text: '#2e7d32', label: 'GOAL' };
        case 'foul': return { bg: '#ffebee', text: '#c62828', label: 'FOUL' };
        case 'snitch': return { bg: '#fff8e1', text: '#f57f17', label: 'SNITCH' };
        default: return { bg: '#e3f2fd', text: '#1565c0', label: 'INFO' };
    }
};

const blinkingDot = {
    width: 10, height: 10, borderRadius: '50%', bgcolor: '#ff1744',
    boxShadow: '0 0 8px #ff1744', display: 'inline-block', mr: 1,
    animation: 'pulse 1.5s infinite ease-in-out',
    '@keyframes pulse': {
        '0%': { opacity: 1, transform: 'scale(1)' },
        '50%': { opacity: 0.4, transform: 'scale(1.2)' },
        '100%': { opacity: 1, transform: 'scale(1)' },
    },
};

const MatchCard = ({ match }) => {
    const navigate = useNavigate();
    const eventStyle = getEventStyle(match.eventType);
    const isLive = match.status === 'IN_PROGRESS';

    return (
        <Paper
            onClick={() => navigate(`/live/${match.id}`, { state: { matchData: match } })}
            elevation={3}
            sx={{
                width: '100%', mb: 3, borderRadius: 4, overflow: 'hidden', background: '#ffffff',
                cursor: 'pointer', transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
            }}
        >
            <Box sx={{ p: 2, borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box display="flex" alignItems="center">
                    {isLive && <Box sx={blinkingDot} />}
                    <Typography variant="caption" fontWeight="bold" color={isLive ? 'error' : 'text.secondary'} sx={{ letterSpacing: 1 }}>
                        {isLive ? 'LIVE' : match.status} • {match.period}
                    </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" fontWeight="medium">
                    {match.stadium}
                </Typography>
            </Box>

            <Box sx={{ p: 4 }}>
                <Grid container alignItems="center" justifyContent="center">
                    <Grid item xs={4} textAlign="center">
                        <Avatar sx={{ width: 70, height: 70, mx: 'auto', mb: 2, bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 'bold' }}>
                            {match.homeTeam.substring(0, 2).toUpperCase()}
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.1 }}>{match.homeTeam}</Typography>
                    </Grid>

                    <Grid item xs={4} textAlign="center">
                        <Typography variant="h2" fontWeight="900" sx={{ color: '#2d3436', letterSpacing: '-2px' }}>
                            {match.homeScore}-{match.awayScore}
                        </Typography>
                        {/* CALCULATED TIMER */}
                        <Typography variant="body2" color="error" fontWeight="bold" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '1.2rem' }}>
                            {match.time}
                        </Typography>
                    </Grid>

                    <Grid item xs={4} textAlign="center">
                        <Avatar sx={{ width: 70, height: 70, mx: 'auto', mb: 2, bgcolor: '#fce4ec', color: '#c2185b', fontWeight: 'bold' }}>
                            {match.awayTeam.substring(0, 2).toUpperCase()}
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.1 }}>{match.awayTeam}</Typography>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ bgcolor: eventStyle.bg, p: 2, borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" fontWeight="900" sx={{ color: eventStyle.text, textTransform: 'uppercase', mr: 2, border: `1px solid ${eventStyle.text}`, px: 1, borderRadius: 1 }}>
                    {eventStyle.label}
                </Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ color: '#333' }}>
                    {match.lastEvent}
                </Typography>
            </Box>
        </Paper>
    );
};

const LiveMatch = () => {
    const [matches, setMatches] = useState(INITIAL_MATCHES);

    // --- EFFECT: UPDATE TIMERS EVERY SECOND ---
    useEffect(() => {
        // Function to update all matches
        const updateAllTimers = () => {
            setMatches(currentMatches =>
                currentMatches.map(match => ({
                    ...match,
                    // Recalculate time based on schedule
                    time: calculateElapsedTime(match.schedule, match.status)
                }))
            );
        };

        // Run immediately to avoid "00:00" flash
        updateAllTimers();

        // Run every second
        const interval = setInterval(updateAllTimers, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', py: 5 }}>
            <Container maxWidth="md">
                <Box mb={5} textAlign="center">
                    <Typography variant="h4" fontWeight="900" color="#1a1a1a" letterSpacing="-1px">
                        Match Center
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        All live matches
                    </Typography>
                </Box>
                <Box>
                    {matches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </Box>
            </Container>
        </Box>
    );
};

export default LiveMatch;