import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Trophy, ChevronLeft, Activity, MapPin, Timer } from 'lucide-react';
import api from '../../services/api';

const MatchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATO ---
    const [matchInfo, setMatchInfo] = useState(null); // Info statiche (nomi team, stadio)
    const [currentScore, setCurrentScore] = useState({ home: 0, away: 0 }); // Punteggi live
    const [gameMinute, setGameMinute] = useState(0); // Minuto di gioco live

    const [teamsMap, setTeamsMap] = useState({});
    const [playersMap, setPlayersMap] = useState({});
    const [eventsLog, setEventsLog] = useState([]);

    const [isConnected, setIsConnected] = useState(false);
    const [isMatchEnded, setIsMatchEnded] = useState(false);

    const stompClientRef = useRef(null);

    // 1. CARICAMENTO DATI INIZIALI (Teams, Players, Info Match)
    useEffect(() => {
        const fetchStaticData = async () => {
            try {
                // A. Carica Info Match (per sapere chi è Home e Away)
                const matchRes = await api.get(`/matches/${id}`);
                setMatchInfo(matchRes.data);

                // Inizializza punteggi se la partita era già iniziata
                setCurrentScore({
                    home: matchRes.data.homeScore || 0,
                    away: matchRes.data.awayScore || 0
                });

                // B. Carica Teams
                const teamRes = await api.get('/teams');
                const tMap = {};
                if (Array.isArray(teamRes.data)) teamRes.data.forEach(t => tMap[t.id] = t.name);
                setTeamsMap(tMap);

                // C. Carica Players
                const playerRes = await api.get('/players');
                const pMap = {};
                if (Array.isArray(playerRes.data)) playerRes.data.forEach(p => {
                    const fullName = p.surname ? `${p.name} ${p.surname}` : p.name;
                    pMap[p.id] = fullName;
                });
                setPlayersMap(pMap);

            } catch (error) {
                console.error("Errore caricamento dati:", error);
            }
        };
        fetchStaticData();
    }, [id]);

    // 2. CONNESSIONE WEBSOCKET
    useEffect(() => {
        const socketUrl = 'http://localhost:8080/ws-quadball'; // Endpoint confermato dal tuo Config

        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            onConnect: () => {
                console.log('CONNESSO AL SIMULATORE!');
                setIsConnected(true);

                // Sottoscrizione al topic di pubblicazione (LiveGameEventPublisher.java)
                client.subscribe(`/topic/match/${id}/events`, (message) => {
                    if (message.body) {
                        try {
                            const eventDTO = JSON.parse(message.body);
                            handleLiveEvent(eventDTO);
                        } catch (e) {
                            console.error("Errore parsing JSON:", e);
                        }
                    }
                });
            },
            onDisconnect: () => setIsConnected(false)
        });

        client.activate();
        stompClientRef.current = client;

        return () => { if (stompClientRef.current) stompClientRef.current.deactivate(); };
    }, [id, matchInfo]); // Dipende da matchInfo per gli ID corretti

    // 3. GESTIONE EVENTI LIVE (Logica Core)
    const handleLiveEvent = (event) => {
        // event corrisponde a LiveGameEventDTO del Java
        // Campi: type, matchScore (Map), gameMinute, playerId, teamId

        // A. Aggiorna Minuto
        setGameMinute(event.gameMinute);

        // B. Aggiorna Punteggi (se presenti nella mappa)
        if (event.matchScore && matchInfo) {
            const newHomeScore = event.matchScore[matchInfo.homeTeamId];
            const newAwayScore = event.matchScore[matchInfo.awayTeamId];

            if (newHomeScore !== undefined && newAwayScore !== undefined) {
                setCurrentScore({ home: newHomeScore, away: newAwayScore });
            }
        }

        // C. Controlla Fine Partita
        if (event.type === 'MATCH_END' || event.type === 'SNITCH_CAUGHT') {
            setIsMatchEnded(true);
        }

        // D. Aggiungi al Log (Costruiamo noi la descrizione)
        const logEntry = {
            ...event,
            description: generateDescription(event),
            style: getEventStyle(event.type)
        };

        setEventsLog(prev => [logEntry, ...prev]);
    };

    // --- HELPERS ---

    // Generatore di testi basato sull'Enum Java
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

    const getEventStyle = (type) => {
        if (type === 'SCORE') return 'border-green-500 bg-green-50';
        if (type === 'SNITCH_CAUGHT') return 'border-yellow-500 bg-yellow-50';
        if (type === 'RED_CARD' || type === 'YELLOW_CARD') return 'border-red-500 bg-red-50';
        if (type === 'MATCH_START' || type === 'MATCH_END') return 'border-blue-500 bg-blue-50';
        return 'border-slate-200 bg-white';
    };

    const getTeamName = (id) => teamsMap[id] || 'Loading...';

    // --- RENDER ---
    if (!matchInfo) return <div className="min-h-screen flex justify-center items-center font-bold text-slate-400">Loading Stadium Data...</div>;

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate('/live')} className="mb-6 flex items-center text-slate-500 hover:text-blue-600 font-medium">
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back
                </button>

                {/* SCOREBOARD */}
                <div className={`bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border-2 ${isMatchEnded ? 'border-yellow-400' : 'border-blue-100'}`}>
                    <div className="bg-slate-50 px-6 py-3 border-b flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {isMatchEnded ? (
                                <span className="text-xs font-black text-yellow-600 tracking-widest uppercase flex items-center gap-2">
                                    <Trophy size={14} /> FINAL SCORE
                                </span>
                            ) : (
                                <>
                                    <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                                    <span className="text-xs font-black text-red-600 tracking-widest uppercase">LIVE SIMULATION</span>
                                </>
                            )}
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={12} /> {matchInfo.stadium || 'Stadium'}
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

                            {/* SCORE & TIMER */}
                            <div className="flex flex-col items-center px-6">
                                <div className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter transition-all duration-300">
                                    {currentScore.home}-{currentScore.away}
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-slate-500 font-mono font-bold text-xl bg-slate-100 px-3 py-1 rounded-full">
                                    <Timer size={20} />
                                    {gameMinute}'
                                </div>
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
                    {eventsLog.length > 0 ? eventsLog.map((ev, idx) => (
                        <div key={idx} className={`p-4 rounded-xl shadow-sm border-l-4 flex items-start gap-4 animate-in slide-in-from-top-2 ${ev.style}`}>
                            <div className="font-mono font-bold text-slate-400 text-sm mt-1">{ev.gameMinute}'</div>
                            <div>
                                <span className="text-[10px] font-black bg-white/50 px-2 py-0.5 rounded uppercase border border-black/5">
                                    {ev.type.replace('_', ' ')}
                                </span>
                                <p className="text-slate-800 font-bold mt-1 text-lg leading-snug">
                                    {ev.description}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 animate-pulse">
                                <Timer className="text-blue-600" size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight">
                                Match Scheduled
                            </h3>
                            <p className="text-slate-500 font-medium mt-2 max-w-xs mx-auto">
                                The players are warming up on the pitch. <br/>
                                Waiting for the referee's whistle to start the game.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchDetail;