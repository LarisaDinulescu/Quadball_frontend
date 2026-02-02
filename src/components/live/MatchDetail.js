import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Trophy, ChevronLeft, Activity, MapPin, Timer, Play, Loader2, Ban } from 'lucide-react'; // Aggiunto Ban icon
import { Button } from "../ui/button";
import api from '../../services/api';

const MatchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATO ---
    const [matchInfo, setMatchInfo] = useState(null);
    const [currentScore, setCurrentScore] = useState({ home: 0, away: 0 });
    const [gameMinute, setGameMinute] = useState(0);

    const [teamsMap, setTeamsMap] = useState({});
    const [playersMap, setPlayersMap] = useState({});
    const [eventsLog, setEventsLog] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    // STATI FONDAMENTALI
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
            if (Array.isArray(user.roles)) return user.roles.includes(targetRole) || user.roles.some(r => r.authority === targetRole || r.name === targetRole);
            if (typeof user.roles === 'string') return user.roles === targetRole;
            if (user.role === targetRole) return true;
            return false;
        } catch (e) { return false; }
    };

    const getTeamName = (id) => teamsMap[id] || `Team ${id}`;

    const getEventStyle = (type) => {
        if (type === 'SCORE') return 'border-green-500 bg-green-50';
        if (type === 'SNITCH_CAUGHT') return 'border-yellow-500 bg-yellow-50';
        if (type === 'RED_CARD' || type === 'YELLOW_CARD') return 'border-red-500 bg-red-50';
        if (type === 'MATCH_START' || type === 'MATCH_END') return 'border-blue-500 bg-blue-50';
        return 'border-slate-200 bg-white';
    };

    const generateDescription = (ev) => {
        const playerName = playersMap[ev.playerId] || `Player ${ev.playerId}`;
        const teamName = teamsMap[ev.teamId] || `Team ${ev.teamId}`;
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

    // --- 2. CARICAMENTO DATI ---
    useEffect(() => {
        const fetchStaticData = async () => {
            try {
                // A. Match Info
                const matchRes = await api.get(`/matches/${id}`);
                setMatchInfo(matchRes.data);

                // --- FIX IMPORTANTE: Se il boccino è stato preso, la partita è FINITA ---
                if (matchRes.data.snitchCaughtByTeamId != null) {
                    setIsMatchEnded(true);
                }

                setCurrentScore({
                    home: matchRes.data.homeScore || 0,
                    away: matchRes.data.awayScore || 0
                });

                // B. Teams
                const teamRes = await api.get('/teams');
                const tMap = {};
                if (Array.isArray(teamRes.data)) teamRes.data.forEach(t => tMap[t.id] = t.name);
                setTeamsMap(tMap);

                // C. Players
                const playerRes = await api.get('/players');
                const pMap = {};
                if (Array.isArray(playerRes.data)) playerRes.data.forEach(p => {
                    const fullName = p.surname ? `${p.name} ${p.surname}` : p.name;
                    pMap[p.id] = fullName;
                });
                setPlayersMap(pMap);

                setLoading(false);
            } catch (error) {
                console.error("Errore dati:", error);
                setLoading(false);
            }
        };
        fetchStaticData();
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

    // --- 4. GESTIONE EVENTI ---
    const handleLiveEvent = (event) => {
        setGameMinute(event.gameMinute);
        if (event.matchScore && matchInfo) {
            const newHome = event.matchScore[matchInfo.homeTeamId];
            const newAway = event.matchScore[matchInfo.awayTeamId];
            if (newHome !== undefined && newAway !== undefined) {
                setCurrentScore({ home: newHome, away: newAway });
            }
        }

        // Se arriva evento di fine o presa boccino, segna come finita
        if (event.type === 'MATCH_END' || event.type === 'SNITCH_CAUGHT') {
            setIsMatchEnded(true);
        }

        const logEntry = {
            ...event,
            description: generateDescription(event),
            style: getEventStyle(event.type)
        };
        setEventsLog(prev => [logEntry, ...prev]);
    };

    // --- 5. AZIONI UTENTE ---
    const handleStartSimulation = async () => {
        try {
            setIsSimulating(true);
            // IMPORTANTE: Assicurati che l'URL qui corrisponda al tuo LiveSimulationController
            await api.post(`/simulation/matches/${id}/start-match`);
            console.log("Simulation started successfully");
        } catch (error) {
            console.error("Error starting match simulation:", error);
            alert("Errore 403: Verifica che il tuo utente sia Manager e che WebSecurityConfig permetta l'accesso a /api/simulation/**");
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

    // Definiamo se la partita è iniziata (se ha punteggio o eventi)
    const isStarted = (matchInfo.homeScore !== null) || (eventsLog.length > 0) || (currentScore.home > 0 || currentScore.away > 0);

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <Button variant="ghost" onClick={() => navigate('/live')} className="mb-6 text-slate-500 hover:text-slate-800 font-bold uppercase text-xs tracking-wider">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back
                </Button>

                {/* SCOREBOARD */}
                <div className={`bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border-2 ${isMatchEnded ? 'border-yellow-400' : 'border-blue-100'}`}>
                    <div className="bg-slate-50 px-6 py-3 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {/* LOGICA STATO AGGIORNATA */}
                            {isMatchEnded ? (
                                <span className="text-xs font-black text-yellow-600 tracking-widest uppercase flex items-center gap-2">
                                    <Trophy size={14} /> FINAL SCORE
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
                            <MapPin size={12} /> {matchInfo.stadiumName || 'Stadium TBA'}
                        </div>
                    </div>

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
                                <div className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter transition-all duration-300">
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
                    {/* Se la partita è iniziata o finita, mostra il feed */}
                    {isStarted || isMatchEnded ? (
                        <>
                            {eventsLog.length === 0 && isMatchEnded && (
                                <div className="text-center py-6 text-slate-400 italic">Match ended (Load events history if available)</div>
                            )}
                            {eventsLog.map((ev, idx) => (
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
                            ))}
                        </>
                    ) : (
                        // PRE-MATCH PANEL
                        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                                {isSimulating ? (
                                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                                ) : (
                                    <Timer className="text-slate-400" size={32} />
                                )}
                            </div>

                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                Match Scheduled
                            </h3>

                            <p className="text-slate-500 font-medium mt-2 max-w-xs mx-auto mb-8">
                                The players are warming up on the pitch. <br/>
                                Waiting for kickoff.
                            </p>

                            {/* CONDIZIONI PER MOSTRARE IL BOTTONE:
                                1. Deve essere Manager
                                2. La partita NON deve essere iniziata (!isStarted)
                                3. La partita NON deve essere finita (!isMatchEnded)
                            */}
                            {isManager() && !isMatchEnded && (
                                <Button
                                    onClick={handleStartSimulation}
                                    disabled={isSimulating}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all uppercase tracking-widest gap-2"
                                >
                                    {isSimulating ? "Starting..." : <><Play size={20} fill="currentColor" /> Simulate Match</>}
                                </Button>
                            )}

                            {/* Se è manager ma la partita è finita */}
                            {isManager() && isMatchEnded && (
                                <p className="text-sm font-bold text-red-400 bg-red-50 px-4 py-2 rounded-full inline-flex items-center gap-2">
                                    <Ban size={16}/> Simulation Disabled (Match Ended)
                                </p>
                            )}

                            {!isManager() && !isMatchEnded && (
                                <p className="text-xs text-slate-400 font-medium bg-slate-50 inline-block px-3 py-1 rounded-full">
                                    Official start pending
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchDetail;