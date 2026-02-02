import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../../services/api";

// UI Components
import { Card, CardContent } from "../ui/card";
import { Loader2, Trophy, MapPin, ArrowRight } from "lucide-react";

export default function LiveMatch() {
    const [matches, setMatches] = useState([]);
    const [teamsMap, setTeamsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const stompClientRef = useRef(null);
    const navigate = useNavigate();

    // Helper data di oggi (YYYY-MM-DD) per il filtro
    const getTodayString = () => {
        const d = new Date();
        return d.toISOString().split('T')[0]; // Es: "2026-02-02"
    };

    // 1. Fetch Iniziale
    useEffect(() => {
        const initData = async () => {
            try {
                setLoading(true);
                // Mappa Team
                const tRes = await api.get('/teams');
                const tMap = {};
                if (Array.isArray(tRes.data)) tRes.data.forEach(t => tMap[t.id] = t.name);
                setTeamsMap(tMap);

                // Lista Match Completa
                const mRes = await api.get('/matches');
                // Manteniamo TUTTI i match nello stato, filtriamo solo al momento del render.
                // Così se una partita programmata inizia via socket, la vedremo apparire.
                const sorted = (mRes.data || []).sort((a, b) => b.id - a.id);
                setMatches(sorted);
            } catch (err) {
                console.error("Error fetching data", err);
            } finally {
                setLoading(false);
            }
        };
        initData();
    }, []);

    // 2. WebSocket
    useEffect(() => {
        const socketUrl = 'http://localhost:8080/ws-quadball';
        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            onConnect: () => {
                client.subscribe('/topic/all-matches', (message) => {
                    if (message.body) handleGlobalUpdate(JSON.parse(message.body));
                });
            },
        });
        client.activate();
        stompClientRef.current = client;
        return () => { if (stompClientRef.current) stompClientRef.current.deactivate(); };
    }, []);

    const handleGlobalUpdate = (event) => {
        setMatches(prev => prev.map(match => {
            if (match.id === event.matchId) {
                const newHomeScore = event.matchScore ? event.matchScore[match.homeTeamId] : match.homeScore;
                const newAwayScore = event.matchScore ? event.matchScore[match.awayTeamId] : match.awayScore;
                const caughtId = (event.type === 'SNITCH_CAUGHT') ? event.teamId : match.snitchCaughtByTeamId;

                return {
                    ...match,
                    homeScore: newHomeScore,
                    awayScore: newAwayScore,
                    gameMinute: event.gameMinute,
                    snitchCaughtByTeamId: caughtId
                };
            }
            return match;
        }));
    };

    const getTeamName = (id) => teamsMap[id] || `Team ${id}`;

    const getMatchStatusConfig = (match) => {
        const isFinished = match.snitchCaughtByTeamId != null;
        const isStarted = match.homeScore !== null && match.awayScore !== null;
        const isLive = isStarted && !isFinished;

        if (isLive) return {
            color: "border-red-600",
            icon: (
                <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
        </span>
            ),
            label: "LIVE",
            labelClass: "text-[10px] font-black text-red-600 tracking-widest uppercase",
            scoreColor: "text-slate-900 scale-110"
        };

        if (isFinished) return {
            color: "border-slate-400",
            icon: <Trophy className="text-slate-400" size={16} />,
            label: "FINISHED",
            labelClass: "text-[10px] font-black text-slate-400 tracking-widest uppercase",
            scoreColor: "text-slate-500"
        };

        // Fallback per Scheduled (anche se verranno filtrate via)
        return {
            color: "border-indigo-600",
            icon: null,
            label: "SCHEDULED",
            labelClass: "text-[10px] font-black text-indigo-600 tracking-widest uppercase",
            scoreColor: "text-slate-300"
        };
    };

    // --- LOGICA DI FILTRAGGIO ---
    const today = getTodayString();

    const displayedMatches = matches.filter(match => {
        const isStarted = match.homeScore !== null && match.awayScore !== null;
        const isFinished = match.snitchCaughtByTeamId != null;
        const isLive = isStarted && !isFinished;

        // Mostra se è LIVE oppure se è FINITA OGGI
        // match.date è una stringa "yyyy-mm-dd" dal backend
        const isFinishedToday = isFinished && match.date === today;

        return isLive || isFinishedToday;
    });

    if (loading) return (
        <div className="flex h-screen items-center justify-center font-bold text-indigo-600 uppercase tracking-widest bg-slate-50">
            <Loader2 className="animate-spin mr-2" /> Loading Matches...
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
                            Match Center
                        </h1>
                        <p className="text-slate-500 font-medium">Today's Live & Results</p>
                    </div>
                </div>

                {displayedMatches.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-lg border-2 border-dashed border-slate-200">
                        <Trophy className="mx-auto text-slate-300 mb-4" size={48}/>
                        <h3 className="text-xl font-bold text-slate-700 uppercase">No Matches Today</h3>
                        <p className="text-slate-400">There are no live or finished games for today.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedMatches.map((match) => {
                            const status = getMatchStatusConfig(match);

                            return (
                                <Card
                                    key={match.id}
                                    className={`bg-white border-none shadow-md hover:shadow-xl transition-all cursor-pointer group border-t-4 ${status.color}`}
                                    onClick={() => navigate(`/live/${match.id}`)}
                                >
                                    <CardContent className="p-6 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                {status.icon}
                                                <span className={status.labelClass}>
                          {status.label}
                        </span>
                                            </div>
                                            {match.gameMinute > 0 && status.label === "LIVE" && (
                                                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {match.gameMinute}'
                         </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div className="flex-1 text-center">
                                                <h2 className="text-lg font-bold uppercase tracking-tight text-slate-800 leading-none">
                                                    {getTeamName(match.homeTeamId)}
                                                </h2>
                                            </div>
                                            <div className={`mx-4 text-4xl font-black tracking-tighter ${status.scoreColor} transition-transform`}>
                                                {match.homeScore !== null ? `${match.homeScore}-${match.awayScore}` : "VS"}
                                            </div>
                                            <div className="flex-1 text-center">
                                                <h2 className="text-lg font-bold uppercase tracking-tight text-slate-800 leading-none">
                                                    {getTeamName(match.awayTeamId)}
                                                </h2>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-slate-500">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-indigo-400" />
                                                <span className="text-xs font-bold uppercase tracking-wide">
                            {match.stadiumId ? `Stadium ${match.stadiumId}` : 'TBA'}
                        </span>
                                            </div>
                                            <ArrowRight size={16} className="text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}