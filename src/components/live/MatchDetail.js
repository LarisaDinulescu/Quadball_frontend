import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, Typography, Paper, Grid, Avatar, Button, CircularProgress, Alert } from '@mui/material';
import liveService from '../../services/liveService';

// --- MOCK DATA ---
const MOCK_DATA = {
    1: {
        id: 1,
        homeTeam: "Milano Gators",
        awayTeam: "Roma Centurions",
        homeScore: 10,
        awayScore: 10,
        schedule: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        period: "1st Half",
        stadium: "Arena Civica, Milano",
        status: "IN_PROGRESS",
        events: [
            { time: "15:00", text: "Goal by Milano! (+10 pts)", type: "goal" },
            { time: "12:30", text: "Bludger hit on Roma Seeker", type: "info" },
            { time: "10:15", text: "Goal by Roma (+10 pts)", type: "goal" },
            { time: "08:00", text: "Foul: Back contact by Milano Beater", type: "foul" },
            { time: "00:00", text: "Match Started", type: "info" }
        ]
    },
    2: {
        id: 2,
        homeTeam: "Venezia Krakens",
        awayTeam: "Firenze Lilies",
        homeScore: 30,
        awayScore: 10,
        schedule: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        period: "2nd Half",
        stadium: "Stadio Penzo, Venezia",
        status: "IN_PROGRESS",
        events: [
            { time: "42:30", text: "Snitch caught by Venezia! (+30 pts)", type: "snitch" },
            { time: "35:00", text: "Timeout called by Firenze", type: "info" },
            { time: "30:20", text: "Goal by Firenze (+10 pts)", type: "goal" }
        ]
    }
};

// --- HELPERS ---
const calculateElapsedTime = (startTimeStr) => {
    if (!startTimeStr) return "00:00";
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

const getEventStyle = (type) => {
    const safeType = type ? type.toLowerCase() : 'info';
    switch (safeType) {
        case 'goal': return { bg: '#e8f5e9', text: '#2e7d32', border: '#2e7d32', label: 'GOAL' };
        case 'foul': return { bg: '#ffebee', text: '#c62828', border: '#c62828', label: 'FOUL' };
        case 'snitch': return { bg: '#fff8e1', text: '#f57f17', border: '#f57f17', label: 'SNITCH' };
        default: return { bg: '#e3f2fd', text: '#1565c0', border: '#1565c0', label: 'INFO' };
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

const MatchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const initialMatch = location.state?.matchData || null;
    const [match, setMatch] = useState(initialMatch);
    const [loading, setLoading] = useState(!initialMatch);
    const [displayTime, setDisplayTime] = useState(initialMatch ? initialMatch.time : "00:00");

    const fetchMatchData = useCallback(async () => {
        try {
            const data = await liveService.getMatchById(id);
            setMatch(data);
        } catch (err) {
            console.warn("Backend unavailable, loading FULL mock data...");
            if (MOCK_DATA[id]) {
                setMatch(MOCK_DATA[id]);
            }
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!initialMatch || !initialMatch.events) {
            fetchMatchData();
        }
        const interval = setInterval(fetchMatchData, 10000);
        return () => clearInterval(interval);
    }, [fetchMatchData, initialMatch]);

    useEffect(() => {
        if (!match || !match.schedule) return;
        const updateTimer = () => {
            const now = new Date();
            const start = new Date(match.schedule);
            if (now < start || match.status === 'SCHEDULED') {
                setDisplayTime("UPCOMING");
            } else if (match.status === 'FINISHED') {
                setDisplayTime("FT");
            } else {
                setDisplayTime(calculateElapsedTime(match.schedule));
            }
        };
        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
        return () => clearInterval(timerInterval);
    }, [match]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
    if (!match) return <Container sx={{mt:5}}><Alert severity="warning">Match not found</Alert></Container>;

    const isLive = match.status === 'IN_PROGRESS' || (new Date() >= new Date(match.schedule) && match.status !== 'FINISHED');

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', py: 4 }}>
            <Container maxWidth="md">
                <Button
                    onClick={() => navigate('/live')}
                    sx={{ mb: 3, color: 'text.secondary', fontWeight: 'bold', textTransform: 'none' }}
                >
                    &larr; Back to all matches
                </Button>

                {/* --- MAIN CARD (IDENTICAL DESIGN TO LIVE MATCH) --- */}
                <Paper
                    elevation={3}
                    sx={{
                        width: '100%',
                        mb: 4,
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: '#ffffff'
                    }}
                >
                    {/* Header (Same as LiveMatch) */}
                    <Box sx={{ p: 2, borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box display="flex" alignItems="center">
                            {isLive && <Box sx={blinkingDot} />}
                            <Typography variant="caption" fontWeight="bold" color={isLive ? 'error' : 'text.secondary'} sx={{ letterSpacing: 1 }}>
                                {isLive ? 'LIVE' : match.status} • {match.period || '-'}
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="medium">
                            {match.stadium}
                        </Typography>
                    </Box>

                    {/* Body (Same styling as LiveMatch) */}
                    <Box sx={{ p: 4 }}>
                        <Grid container alignItems="center" justifyContent="center">
                            {/* HOME */}
                            <Grid item xs={4} textAlign="center">
                                <Avatar sx={{ width: 70, height: 70, mx: 'auto', mb: 2, bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 'bold', fontSize: '1.4rem' }}>
                                    {match.homeTeam ? match.homeTeam.substring(0, 2).toUpperCase() : 'HT'}
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.1 }}>
                                    {match.homeTeam}
                                </Typography>
                            </Grid>

                            {/* SCORE */}
                            <Grid item xs={4} textAlign="center">
                                <Typography variant="h2" fontWeight="900" sx={{ color: '#2d3436', letterSpacing: '-2px' }}>
                                    {match.homeScore}-{match.awayScore}
                                </Typography>
                                <Typography variant="body2" color="error" fontWeight="bold" sx={{ mt: 1, fontFamily: 'monospace', fontSize: '1.2rem' }}>
                                    {displayTime}
                                </Typography>
                            </Grid>

                            {/* AWAY */}
                            <Grid item xs={4} textAlign="center">
                                <Avatar sx={{ width: 70, height: 70, mx: 'auto', mb: 2, bgcolor: '#fce4ec', color: '#c2185b', fontWeight: 'bold', fontSize: '1.4rem' }}>
                                    {match.awayTeam ? match.awayTeam.substring(0, 2).toUpperCase() : 'AT'}
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.1 }}>
                                    {match.awayTeam}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                    {/* No Footer here because we have the commentary below */}
                </Paper>

                {/* --- COMMENTARY LIST --- */}
                <Typography variant="h5" fontWeight="900" sx={{ mb: 3, color: '#1a1a1a' }}>Live Commentary</Typography>
                <Box>
                    {match.events && match.events.length > 0 ? (
                        match.events.map((event, index) => {
                            const style = getEventStyle(event.type);
                            return (
                                <Paper key={index} elevation={0} sx={{
                                    p: 2, mb: 2, borderRadius: 3, bgcolor: '#ffffff',
                                    borderLeft: `6px solid ${style.border}`,
                                    display: 'flex', alignItems: 'center',
                                    transition: 'transform 0.1s', '&:hover': { transform: 'translateX(4px)' }
                                }}>
                                    <Typography variant="subtitle1" fontWeight="bold" sx={{ minWidth: 60, color: '#555' }}>
                                        {event.time}'
                                    </Typography>
                                    <Box sx={{
                                        bgcolor: style.bg, color: style.text,
                                        px: 1.5, py: 0.5, borderRadius: 1.5, mr: 2,
                                        fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase'
                                    }}>
                                        {style.label}
                                    </Box>
                                    <Typography variant="body1" fontWeight="500" color="text.primary">
                                        {event.text}
                                    </Typography>
                                </Paper>
                            );
                        })
                    ) : (
                        <Alert severity="info">No commentary available yet.</Alert>
                    )}
                </Box>
            </Container>
        </Box>
    );
};

export default MatchDetail;