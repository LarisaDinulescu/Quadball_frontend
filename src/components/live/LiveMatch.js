import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import api from "../../services/api";

// Assicurati di avere questi componenti UI
import { Card, CardContent } from "../ui/card";
import { Loader2, Trophy, MapPin, ArrowRight, Timer, Calendar } from "lucide-react";

export default function LiveMatch() {
    const [matches, setMatches] = useState([]);
    const [teamsMap, setTeamsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const stompClientRef = useRef(null);
    const navigate = useNavigate();

    // Helper Data Oggi
    const getTodayString = () => {
        const d = new Date();
        return d.toISOString().split('T')[0];
    };

    // Helper Manager Blindato
    const isManager = () => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return false;
        try {
            const user = JSON.parse(userStr);
            const targetRole = 'ROLE_ORGANIZATION_MANAGER';

            // Controlla tutte le possibili strutture dei ruoli
            if (Array.isArray(user.roles)) {
                // Caso array di stringhe o array di oggetti
                return user.roles.includes(targetRole) || user.roles.some(r => r.name === targetRole || r.authority === targetRole);
            }
            if (typeof user.roles === 'string') return user.roles === targetRole;
            if (user.role === targetRole) return true;

            return false;
        } catch (e) { return false; }
    };

    // 1. Init Data
    useEffect(() => {
        const initData = async () => {
            try {
                setLoading(true);
                const tRes = await api.get('/teams');
                const tMap = {};
                if (Array.isArray(tRes.data)) tRes.data.forEach(t => tMap[t.id] = t.name);
                setTeamsMap(tMap);

                const mRes = await api.get('/matches');
                const sorted = (mRes.data || []).sort((a, b) => b.id - a.id);
                setMatches(sorted);
            } catch (err) { console.error(err); } finally { setLoading(false); }
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

    // 3. Configurazione Grafica Stato
    const getMatchStatusConfig = (match) => {
        const isFinished = match.snitchCaughtByTeamId != null;
        const isStarted = match.homeScore !== null && match.awayScore !== null;
        const isLive = isStarted && !isFinished;

        if (isLive) return {
            borderColor: "border-red-500", // Bordo Rosso acceso
            icon: (
                <span className="relative flex h-2.5 w-2.5 mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
        </span>
            ),
            label: "LIVE NOW",
            labelClass: "text-red-600 font-black tracking-widest",
            scoreClass: "text-slate-900 scale-110",
            showMinute: true
        };

        if (isFinished) return {
            borderColor: "border-yellow-500", // Bordo Giallo Oro
            icon: <Trophy size={14} className="text-yellow-600 mr-1" />,
            label: "FINAL SCORE",
            labelClass: "text-yellow-600 font-black tracking-widest",
            scoreClass: "text-slate-900",
            showMinute: false
        };

        return {
            borderColor: "border-indigo-500", // Bordo Indaco standard
            icon: <Calendar size={14} className="text-indigo-600 mr-1" />,
            label: "SCHEDULED",
            labelClass: "text-indigo-600 font-black tracking-widest",
            scoreClass: "text-slate-300",
            showMinute: false
        };
    };

    // 4. Logica Filtro
    const today = getTodayString();
    const userIsManager = isManager();

    const displayedMatches = matches.filter(match => {
        const isStarted = match.homeScore !== null && match.awayScore !== null;
        const isFinished = match.snitchCaughtByTeamId != null;
        const isLive = isStarted && !isFinished;

        if (isLive) return true;
        if (isFinished && match.date === today) return true;

        // Il manager vede anche le programmate per poterle avviare
        const isScheduled = !isStarted && !isFinished;
        if (userIsManager && isScheduled) return true;

        return false;
    });

    if (loading) return (
        <div className="flex h-screen items-center justify-center font-bold text-indigo-600 uppercase tracking-widest bg-slate-50">
            <Loader2 className="animate-spin mr-2" /> Loading Arena...
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
                        <p className="text-slate-500 font-medium">Real-time scores & updates</p>
                    </div>
                </div>

                {displayedMatches.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
                        <Trophy className="mx-auto text-slate-300 mb-4" size={48}/>
                        <h3 className="text-xl font-bold text-slate-700 uppercase">No Matches Active</h3>
                        <p className="text-slate-400">Wait for the tournament to begin.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedMatches.map((match) => {
                            const status = getMatchStatusConfig(match);

                            return (
                                <Card
                                    key={match.id}
                                    className={`bg-white border-none shadow-md hover:shadow-xl transition-all cursor-pointer group border-t-4 ${status.borderColor}`}
                                    onClick={() => navigate(`/live/${match.id}`)}
                                >
                                    <CardContent className="p-6">
                                        {/* Header Stato */}
                                        <div className="flex justify-between items-center mb-6">
                                            <div className="flex items-center">
                                                {status.icon}
                                                <span className={`text-[10px] uppercase ${status.labelClass}`}>
                          {status.label}
                        </span>
                                            </div>
                                            {match.gameMinute > 0 && status.showMinute && (
                                                <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                           {match.gameMinute}'
                        </span>
                                            )}
                                        </div>

                                        {/* Scoreboard */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 text-center">
                                                <h2 className="text-sm font-bold uppercase tracking-tight text-slate-800 leading-tight">
                                                    {getTeamName(match.homeTeamId)}
                                                </h2>
                                            </div>

                                            <div className={`mx-3 text-3xl font-black tracking-tighter ${status.scoreClass}`}>
                                                {match.homeScore !== null ? `${match.homeScore}-${match.awayScore}` : "VS"}
                                            </div>

                                            <div className="flex-1 text-center">
                                                <h2 className="text-sm font-bold uppercase tracking-tight text-slate-800 leading-tight">
                                                    {getTeamName(match.awayTeamId)}
                                                </h2>
                                            </div>
                                        </div>

                                        {/* Footer Location */}
                                        <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={12} />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">
                            {match.stadiumId ? `Stadium ${match.stadiumId}` : 'Arena TBA'}
                        </span>
                                            </div>
                                            <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 text-indigo-600" />
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