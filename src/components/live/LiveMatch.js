import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Activity, Trophy } from 'lucide-react';
import liveService from '../../services/liveService';

// --- TIME HELPER ---
const calculateElapsedTime = (startTimeStr) => {
    if (!startTimeStr) return "00:00";
    const start = new Date(startTimeStr).getTime();
    const now = new Date().getTime();
    if (now < start) return "00:00";
    const diffMs = now - start;
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
};

// --- MOCK DATABASE (Contains EVERYTHING: Old, Live, Future) ---
const MOCK_DATABASE = [
    {
        id: 1, homeTeam: "Gryffindor", awayTeam: "Slytherin",
        homeScore: 40, awayScore: 30,
        // INIZIATA 15 MIN FA -> DEVE ESSERE SCARICATA
        schedule: new Date(Date.now() - (15 * 60 * 1000)).toISOString(),
        period: "1st Half", stadium: "Hogwarts Pitch",
        snitchCaughtBy: null,
        events: [
            { time: "00:00", text: "Brooms Up!", type: "info" },
            { time: "15:00", text: "Goal by Gryffindor!", type: "goal" }
        ]
    },
    {
        id: 2, homeTeam: "Ravenclaw", awayTeam: "Hufflepuff",
        homeScore: 150, awayScore: 160,
        // FINITA 1 ORA FA (Rientra nelle 3 ore) -> DEVE ESSERE SCARICATA
        schedule: new Date(Date.now() - (60 * 60 * 1000)).toISOString(),
        period: "Finished", stadium: "Quidditch World Cup Stadium",
        snitchCaughtBy: "away",
        events: [{ time: "55:00", text: "SNITCH CAUGHT BY HUFFLEPUFF!", type: "snitch" }]
    },
    {
        id: 3, homeTeam: "Bulgaria", awayTeam: "Ireland",
        homeScore: 0, awayScore: 0,
        // VECCHIA (Ieri) -> NON DEVE ESSERE SCARICATA
        schedule: new Date(Date.now() - (24 * 60 * 60 * 1000)).toISOString(),
        period: "Finished", stadium: "Top Box", snitchCaughtBy: "home", events: []
    },
    {
        id: 4, homeTeam: "France", awayTeam: "Spain",
        homeScore: 0, awayScore: 0,
        // FUTURA (Tra 2 ore) -> NON DEVE ESSERE SCARICATA (ancora)
        schedule: new Date(Date.now() + (120 * 60 * 1000)).toISOString(),
        period: "-", stadium: "Beauxbatons", snitchCaughtBy: null, events: []
    }
];

const MatchCard = ({ match }) => {
    const navigate = useNavigate();
    const latestEvent = match.events && match.events.length > 0
        ? match.events[match.events.length - 1]
        : { text: "No recent events", type: "info" };
    const isSnitchCaught = !!match.snitchCaughtBy;

    const getEventColor = (type) => {
        switch (type) {
            case 'goal': return 'bg-green-100 text-green-800 border-green-200';
            case 'foul': return 'bg-red-100 text-red-800 border-red-200';
            case 'snitch': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <div
            onClick={() => navigate(`/live/${match.id}`, { state: { matchData: match } })}
            className={`w-full bg-white rounded-xl shadow-md overflow-hidden mb-6 cursor-pointer hover:shadow-xl transition-all duration-300 group border ${isSnitchCaught ? 'border-yellow-400 ring-1 ring-yellow-200' : 'border-slate-200 hover:border-blue-400'}`}
        >
            <div className="px-6 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-2">
                    {!isSnitchCaught ? (
                        <>
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            <span className="text-xs font-bold text-red-600 tracking-wider uppercase">LIVE • {match.period}</span>
                        </>
                    ) : (
                        <span className="text-xs font-black text-yellow-600 tracking-wider flex items-center gap-2 uppercase">
                            <Trophy className="w-4 h-4" /> Game Over • Snitch Caught
                        </span>
                    )}
                </div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{match.stadium}</span>
            </div>

            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center flex-1 relative">
                        {match.snitchCaughtBy === 'home' && (
                            <div className="absolute -top-5 animate-bounce z-10">
                                <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-sm" fill="currentColor" />
                            </div>
                        )}
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl md:text-2xl font-black mb-3 shadow-sm border-2 transition-transform group-hover:scale-105 ${match.snitchCaughtBy === 'home' ? 'bg-yellow-50 text-yellow-600 border-yellow-300' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            {match.homeTeam.substring(0, 1).toUpperCase()}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 text-center leading-tight uppercase italic">{match.homeTeam}</h3>
                    </div>

                    <div className="flex flex-col items-center px-4">
                        <div className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                            {match.homeScore}-{match.awayScore}
                        </div>
                        <div className={`mt-2 flex items-center gap-1 font-mono font-bold text-lg ${isSnitchCaught ? 'text-slate-400' : 'text-red-500'}`}>
                            {!isSnitchCaught && <Timer className="w-4 h-4" />}
                            {isSnitchCaught ? "FT" : match.time}
                        </div>
                    </div>

                    <div className="flex flex-col items-center flex-1 relative">
                        {match.snitchCaughtBy === 'away' && (
                            <div className="absolute -top-5 animate-bounce z-10">
                                <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-sm" fill="currentColor" />
                            </div>
                        )}
                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-xl md:text-2xl font-black mb-3 shadow-sm border-2 transition-transform group-hover:scale-105 ${match.snitchCaughtBy === 'away' ? 'bg-yellow-50 text-yellow-600 border-yellow-300' : 'bg-green-50 text-green-700 border-green-100'}`}>
                            {match.awayTeam.substring(0, 1).toUpperCase()}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 text-center leading-tight uppercase italic">{match.awayTeam}</h3>
                    </div>
                </div>
            </div>

            <div className={`px-6 py-2 flex items-center justify-center gap-2 border-t text-sm ${getEventColor(latestEvent.type)}`}>
                <Activity className="w-4 h-4" />
                <span className="font-bold uppercase text-xs">Latest:</span>
                <span className="font-medium truncate">{latestEvent.text}</span>
            </div>
        </div>
    );
};

const LiveMatch = () => {
    // Stato iniziale vuoto (nessun dato finché non scarichiamo)
    const [matches, setMatches] = useState([]);

    const fetchMatches = async () => {
        try {
            // 1. Chiamiamo il backend. Ci aspettiamo che il backend ci dia SOLO le partite giuste.
            const data = await liveService.getLiveMatches();
            setMatches(data); // Usiamo direttamente i dati ricevuti

        } catch (error) {
            console.warn("Backend non raggiungibile. Simulo la query del backend sui dati Mock...");

            // LOGICA DI SIMULAZIONE BACKEND (Solo per sviluppo)
            // Filtriamo il MOCK_DATABASE per restituire solo quello che restituirebbe il server
            const now = Date.now();
            const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

            const simulatedBackendResponse = MOCK_DATABASE.filter(m => {
                const start = new Date(m.schedule).getTime();

                // La logica SQL sarebbe: WHERE start_time > (NOW - 3h) AND start_time <= NOW
                const hasStarted = start <= now;
                const isRelevant = (now - start) < THREE_HOURS_MS;

                return hasStarted && isRelevant;
            });

            setMatches(simulatedBackendResponse);
        }
    };

    useEffect(() => {
        fetchMatches();
        const pollInterval = setInterval(fetchMatches, 10000);
        const timerInterval = setInterval(() => {
            setMatches(current => current.map(m => ({ ...m, time: calculateElapsedTime(m.schedule) })));
        }, 1000);

        return () => { clearInterval(pollInterval); clearInterval(timerInterval); };
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                        Live <span className="text-blue-600">Match</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {matches.length > 0 ? (
                        matches.map(match => <MatchCard key={match.id} match={match} />)
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-xl shadow-md border border-slate-200">
                            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-700">No live matches</h3>
                            <p className="text-slate-400 mt-2">Matches appear here automatically when they start.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveMatch;