import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Trophy, ChevronLeft, Activity, MapPin, Timer, Play, Loader2, RefreshCw, Calendar, Clock } from 'lucide-react';
import { Button } from "../ui/button";
import api from '../../services/api';

const MatchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATO ---
    const [matchInfo, setMatchInfo] = useState(null);
    const [currentScore, setCurrentScore] = useState({ home: 0, away: 0 });
    const [gameMinute, setGameMinute] = useState(0);

    // Mappe per convertire ID in Nomi
    const [teamsMap, setTeamsMap] = useState({});
    const [playersMap, setPlayersMap] = useState({});

    const [eventsLog, setEventsLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    // Stati di controllo
    const [isMatchEnded, setIsMatchEnded] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);

    const stompClientRef = useRef(null);

    // --- 1. HELPERS & UTILS ---
    const isManager = () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return false;
        try {
            const user = JSON.parse(userStr);
            const targetRole = 'ROLE_ORGANIZATION_MANAGER';
            if (Array.isArray(user.roles)) return user.roles.includes(targetRole) || user.roles.some(r => r.name === targetRole || r.authority === targetRole);
            if (typeof user.roles === 'string') return user.roles === targetRole;
            if (user.role === targetRole) return true;
            return false;
        } catch (e) { return false; }
    };

    const getTeamName = (id, map = teamsMap) => map[id] || `Team ${id}`;

    // Formattazione Data e Ora
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        return timeStr.substring(0, 5); // Prende solo HH:MM
    };

    const getEventStyle = (type) => {
        if (type === 'SCORE') return 'border-green-500 bg-green-50';
        if (type === 'SNITCH_CAUGHT') return 'border-yellow-500 bg-yellow-50';
        if (type === 'RED_CARD' || type === 'YELLOW_CARD') return 'border-red-500 bg-red-50';
        if (type === 'MATCH_START' || type === 'MATCH_END') return 'border-blue-500 bg-blue-50';
        return 'border-slate-200 bg-white';
    };

    // Generatore descrizioni (accetta mappe opzionali per funzionare durante il load iniziale)
    const generateDescription = (ev, tMap = teamsMap, pMap = playersMap) => {
        // Recupera nome giocatore e team dalle mappe
        const playerName = pMap[ev.playerId] || `Player ${ev.playerId}`;
        const teamName = tMap[ev.teamId] || `Team ${ev.teamId}`;

        switch (ev.type) {
            case 'MATCH_START': return "The Quaffle is released! Match Started.";
            case 'SCORE': return `GOAL! ${playerName} scores 10 points for ${teamName}!`;
            case 'SNITCH_CAUGHT': return `SNITCH CAUGHT! ${playerName} ends the game for ${teamName}!`;
            case 'YELLOW_CARD': return `Yellow Card for ${playerName}.`;
            case 'RED_CARD': return `RED CARD! ${playerName} is sent off!`;
            case 'SUBSTITUTION_IN': return `Substitution: ${playerName} enters the pitch.`;
            case 'SUBSTITUTION_OUT': return `Substitution: ${playerName} leaves the pitch.`;
            case 'MATCH_END': return "The referee blows the final whistle.";
            default: return `Event ${ev.type} by ${teamName}`;
        }
    };

    // --- 2. CARICAMENTO DATI (CORRETTO con Promise.all) ---
    useEffect(() => {
        const fetchAllData = async () => {
            try {
                // 1. Scarichiamo TUTTO in parallelo per avere le mappe pronte subito
                const [matchRes, teamRes, playerRes] = await Promise.all([
                    api.get(`/matches/${id}`),
                    api.get('/teams'),
                    api.get('/players')
                ]);

                // A. Costruiamo le Mappe SUBITO
                const tMap = {};
                if (Array.isArray(teamRes.data)) teamRes.data.forEach(t => tMap[t.id] = t.name);

                const pMap = {};
                if (Array.isArray(playerRes.data)) playerRes.data.forEach(p => {
                    // Combina Nome e Cognome se presente
                    const fullName = p.surname ? `${p.name} ${p.surname}` : p.name;
                    pMap[p.id] = fullName;
                });

                // Salviamo nello stato per l'uso futuro
                setTeamsMap(tMap);
                setPlayersMap(pMap);
                setMatchInfo(matchRes.data);

                // B. Impostiamo punteggi e stato
                if (matchRes.data.snitchCaughtByTeamId != null) {
                    setIsMatchEnded(true);
                }
                setCurrentScore({
                    home: matchRes.data.homeScore || 0,
                    away: matchRes.data.awayScore || 0
                });

                // C. Ora scarichiamo lo storico eventi e usiamo le mappe APPENA create
                try {
                    const eventsRes = await api.get(`/live-game-events/match/${id}`);

                    if (Array.isArray(eventsRes.data) && eventsRes.data.length > 0) {
                        const sortedEvents = eventsRes.data.sort((a, b) => b.gameMinute - a.gameMinute || new Date(b.timestamp) - new Date(a.timestamp));

                        // Controllo finale
                        const lastEvent = sortedEvents[0];
                        if (lastEvent.type === 'MATCH_END' || lastEvent.type === 'SNITCH_CAUGHT') {
                            setIsMatchEnded(true);
                        }

                        // Formattiamo usando tMap e pMap locali!
                        const formattedEvents = sortedEvents.map(ev => ({
                            ...ev,
                            description: generateDescription(ev, tMap, pMap),
                            style: getEventStyle(ev.type)
                        }));

                        setEventsLog(formattedEvents);
                        setGameMinute(formattedEvents[0].gameMinute);
                    }
                } catch (e) {
                    console.warn("Nessun evento storico o errore API", e);
                }

                setLoading(false);
            } catch (error) {
                console.error("Errore caricamento dati:", error);
                setLoading(false);
            }
        };
        fetchAllData();
    }, [id]);

    // --- 3. WEBSOCKET ---
    useEffect(() => {
        const socketUrl = 'http://localhost:8080/ws-quadball';
        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            onConnect: () => {
                setIsConnected(true);
                client.subscribe(`/topic/match/${id}/events`, (message) => {
                    if (message.body) {
                        try {
                            const eventDTO = JSON.parse(message.body);
                            handleLiveEvent(eventDTO);
                        } catch (e) { console.error(e); }
                    }
                });
            },
            onDisconnect: () => setIsConnected(false)
        });
        client.activate();
        stompClientRef.current = client;
        return () => { if (stompClientRef.current) stompClientRef.current.deactivate(); };
    }, [id, matchInfo]);

    // --- 4. GESTIONE EVENTI LIVE ---
    const handleLiveEvent = (event) => {
        setGameMinute(event.gameMinute);
        if (event.matchScore && matchInfo) {
            const newHome = event.matchScore[matchInfo.homeTeamId];
            const newAway = event.matchScore[matchInfo.awayTeamId];
            if (newHome !== undefined && newAway !== undefined) {
                setCurrentScore({ home: newHome, away: newAway });
            }
        }

        // Se arriva un evento di reset (Start), resetta lo stato finito
        if (event.type === 'MATCH_START') {
            setIsMatchEnded(false);
        }
        // Se arriva evento di fine
        else if (event.type === 'MATCH_END' || event.type === 'SNITCH_CAUGHT') {
            setIsMatchEnded(true);
        }

        const logEntry = {
            ...event,
            description: generateDescription(event), // Qui usa lo stato globale (aggiornato)
            style: getEventStyle(event.type)
        };
        setEventsLog(prev => [logEntry, ...prev]);
    };

    // --- 5. AZIONI UTENTE ---
    const handleStartSimulation = async () => {
        try {
            setIsSimulating(true);

            // Reset immediato UI
            setIsMatchEnded(false);
            setEventsLog([]);
            setGameMinute(0);
            setCurrentScore({home: 0, away: 0});

            await api.post(`/simulation/matches/${id}/start-match`);
            console.log("Simulation started successfully");
        } catch (error) {
            console.error("Error starting match simulation:", error);
            alert("Errore avvio simulazione.");
        } finally {
            setIsSimulating(false);
        }
    };

    // --- RENDER ---
    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-slate-50 font-bold text-indigo-600 uppercase tracking-widest">
            <Loader2 className="animate-spin mr-2" /> Loading Match Center...
        </div>
    );

    if (!matchInfo) return <div className="p-10 text-center">Match not found</div>;

    const isStarted = (matchInfo.homeScore !== null) || (eventsLog.length > 0) || (currentScore.home > 0 || currentScore.away > 0);

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Navigazione */}
                <div className="flex justify-between items-center mb-6">
                    <Button variant="ghost" onClick={() => navigate('/live')} className="text-slate-500 hover:text-slate-800 font-bold uppercase text-xs tracking-wider">
                        <ChevronLeft className="w-5 h-5 mr-1" /> Back to Arena
                    </Button>

                    {/* DATA E ORA */}
                    <div className="flex items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-wider bg-white px-4 py-2 rounded-full shadow-sm">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-indigo-500"/> {formatDate(matchInfo.date)}
                        </span>
                        <span className="w-px h-3 bg-slate-300"></span>
                        <span className="flex items-center gap-1.5">
                            <Clock size={14} className="text-indigo-500"/> {formatTime(matchInfo.time) || "TBA"}
                        </span>
                    </div>
                </div>

                {/* SCOREBOARD */}
                <div className={`bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border-2 ${
                    isMatchEnded ? 'border-slate-300' : (isStarted ? 'border-red-400' : 'border-blue-100')
                }`}>
                    {/* Scoreboard Header */}
                    <div className="bg-slate-50 px-6 py-3 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {isMatchEnded ? (
                                <span className="text-xs font-black text-slate-600 bg-slate-200 px-3 py-1 rounded-full tracking-widest uppercase flex items-center gap-2">
                                    <Trophy size={14} className="text-yellow-600"/> FINISHED
                                </span>
                            ) : isStarted ? (
                                <>
                                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                                    <span className="text-xs font-black text-red-600 tracking-widest uppercase">LIVE</span>
                                </>
                            ) : (
                                <span className="text-xs font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
                                    <Timer size={14} /> SCHEDULED
                                </span>
                            )}
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={12} /> {matchInfo.stadiumName || `Stadium ${matchInfo.stadiumId || 'TBA'}`}
                        </div>
                    </div>

                    {/* Scoreboard Body */}
                    <div className="p-8">
                        <div className="flex items-center justify-between">
                            {/* HOME */}
                            <div className="flex flex-col items-center flex-1">
                                <h2 className="text-xl md:text-3xl font-black text-slate-900 text-center uppercase italic">
                                    {getTeamName(matchInfo.homeTeamId)}
                                </h2>
                            </div>

                            {/* SCORE */}
                            <div className="flex flex-col items-center px-6">
                                <div className={`text-6xl md:text-8xl font-black tracking-tighter transition-all duration-300 ${isMatchEnded ? 'text-slate-700' : 'text-slate-900'}`}>
                                    {isStarted ? `${currentScore.home}-${currentScore.away}` : "VS"}
                                </div>
                                {isStarted && !isMatchEnded && (
                                    <div className="mt-2 flex items-center gap-2 text-slate-500 font-mono font-bold text-xl bg-slate-100 px-3 py-1 rounded-full">
                                        <Timer size={20} />
                                        {gameMinute}'
                                    </div>
                                )}
                            </div>

                            {/* AWAY */}
                            <div className="flex flex-col items-center flex-1">
                                <h2 className="text-xl md:text-3xl font-black text-slate-900 text-center uppercase italic">
                                    {getTeamName(matchInfo.awayTeamId)}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LIVE FEED */}
                <h3 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
                    <Activity className="text-blue-600" /> Match Commentary
                </h3>

                <div className="space-y-3">
                    {eventsLog.length > 0 ? (
                        eventsLog.map((ev, idx) => (
                            <div key={idx} className={`p-4 rounded-xl shadow-sm border-l-4 flex items-start gap-4 animate-in slide-in-from-top-2 ${ev.style}`}>
                                <div className="font-mono font-bold text-slate-400 text-sm mt-1">{ev.gameMinute}'</div>
                                <div>
                                    <span className="text-[10px] font-black bg-white/50 px-2 py-0.5 rounded uppercase border border-black/5">
                                        {ev.type.replace(/_/g, ' ')}
                                    </span>
                                    <p className="text-slate-800 font-bold mt-1 text-lg leading-snug">
                                        {ev.description}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        !isMatchEnded && (
                            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                    <Timer className="text-slate-400" size={32} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                    Match Scheduled
                                </h3>
                                <p className="text-slate-500 font-medium mt-2 max-w-xs mx-auto mb-8">
                                    Waiting for kickoff.
                                </p>
                            </div>
                        )
                    )}

                    {/* MANAGER ZONE */}
                    {isManager() && (
                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-black text-slate-700 uppercase tracking-wide">Manager Zone</h4>
                                    <p className="text-xs text-slate-500">
                                        {isMatchEnded ? "Match finished. Restart simulation?" : "Control the match."}
                                    </p>
                                </div>
                                <Button
                                    onClick={handleStartSimulation}
                                    disabled={isSimulating}
                                    className={`${isMatchEnded ? "bg-orange-500 hover:bg-orange-600" : "bg-indigo-600 hover:bg-indigo-700"} text-white font-bold px-6 py-2 rounded-full shadow-md uppercase tracking-widest gap-2 flex items-center`}
                                >
                                    {isSimulating ? "Starting..." : (
                                        <>
                                            {isMatchEnded ? <RefreshCw size={16} /> : <Play size={16} fill="currentColor" />}
                                            {isMatchEnded ? "Re-Simulate" : "Start Simulation"}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchDetail;