import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Trophy, AlertCircle, CheckCircle2, Timer } from 'lucide-react';
import liveService from '../../services/liveService';

// --- MOCK DETAIL DATA (HARRY POTTER) ---
const MOCK_DETAIL = {
    1: {
        id: 1, homeTeam: "Gryffindor", awayTeam: "Slytherin",
        // 40 - 30
        homeScore: 40, awayScore: 30,
        schedule: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        period: "1st Half", stadium: "Hogwarts Pitch",
        snitchCaughtBy: null,
        events: [
            { time: "00:00", text: "Match Started", type: "info" },
            { time: "05:00", text: "Goal by Slytherin Chaser (+10)", type: "goal" },
            { time: "08:00", text: "Goal by Gryffindor (+10)", type: "goal" },
            { time: "10:30", text: "Bludger hit on Slytherin Seeker", type: "info" },
            { time: "12:00", text: "Goal by Gryffindor (+10)", type: "goal" },
            { time: "15:00", text: "Goal by Gryffindor (+10)", type: "goal" }
        ]
    },
    2: {
        id: 2, homeTeam: "Ravenclaw", awayTeam: "Hufflepuff",
        // 150 - 160 (Hufflepuff wins by Snitch)
        homeScore: 150, awayScore: 160,
        schedule: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        period: "Finished", stadium: "Quidditch World Cup Stadium",
        snitchCaughtBy: 'away',
        events: [
            { time: "00:00", text: "Match Started", type: "info" },
            { time: "35:00", text: "Timeout called by Ravenclaw", type: "info" },
            { time: "40:00", text: "Goal Ravenclaw (+10)", type: "goal" },
            { time: "42:00", text: "Goal Hufflepuff (+10)", type: "goal" },
            { time: "45:20", text: "SNITCH CAUGHT BY HUFFLEPUFF! (+30)", type: "snitch" }
        ]
    }
};

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

const MatchDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const initialMatch = location.state?.matchData || null;
    const [match, setMatch] = useState(initialMatch);
    const [loading, setLoading] = useState(!initialMatch);
    const [displayTime, setDisplayTime] = useState("00:00");

    const fetchMatchData = useCallback(async () => {
        try {
            const data = await liveService.getMatchById(id);
            setMatch(data);
        } catch (err) {
            console.warn("API Error, using mock data for demo...");
            if (MOCK_DETAIL[id]) setMatch(MOCK_DETAIL[id]);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!initialMatch || !initialMatch.events) fetchMatchData();
        const interval = setInterval(fetchMatchData, 10000);
        return () => clearInterval(interval);
    }, [fetchMatchData, initialMatch]);

    // Timer Logic
    useEffect(() => {
        if (!match?.schedule) return;
        const timer = setInterval(() => {
            // !!! GAME OVER LOGIC !!!
            // If Snitch is caught, time stops. Game is over.
            if (match.snitchCaughtBy) {
                setDisplayTime("END");
            } else {
                const start = new Date(match.schedule).getTime();
                const now = new Date().getTime();
                const MAX_DURATION = 3 * 60 * 60 * 1000;

                if (start <= now && (now - start) < MAX_DURATION) {
                    setDisplayTime(calculateElapsedTime(match.schedule));
                } else {
                    setDisplayTime("FT"); // Full Time (Time limit reached)
                }
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [match]);

    if (loading) return <div className="min-h-screen flex justify-center items-center text-blue-600 font-bold">Loading match data...</div>;
    if (!match) return <div className="min-h-screen flex justify-center items-center font-bold text-slate-500">Match not found</div>;

    const sortedEvents = match.events ? [...match.events].reverse() : [];
    const isSnitchCaught = !!match.snitchCaughtBy;

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate('/live')}
                    className="mb-6 flex items-center text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" /> Back to Match Center
                </button>

                {/* --- MAIN SCOREBOARD CARD --- */}
                <div className={`w-full bg-white rounded-xl shadow-md overflow-hidden mb-8 border transition-all ${isSnitchCaught ? 'border-yellow-400 ring-1 ring-yellow-100' : 'border-slate-200'}`}>

                    {/* Header */}
                    <div className="px-6 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                        <div className="flex items-center gap-2">
                            {!isSnitchCaught ? (
                                <>
                                    <span className="relative flex h-2.5 w-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                    </span>
                                    <span className="text-xs font-bold text-red-600 tracking-wider uppercase">
                                        LIVE • {match.period || 'In Progress'}
                                    </span>
                                </>
                            ) : (
                                // TROPHY ICON HERE
                                <span className="text-xs font-black text-yellow-600 tracking-wider flex items-center gap-2 uppercase">
                                    <Trophy className="w-4 h-4" /> Game Over • Snitch Caught
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{match.stadium}</span>
                    </div>

                    {/* Body */}
                    <div className="p-8">
                        <div className="flex items-center justify-between">

                            {/* HOME TEAM */}
                            <div className="flex flex-col items-center flex-1 relative">
                                {/* GOLDEN SNITCH INDICATOR (HOME) */}
                                {match.snitchCaughtBy === 'home' && (
                                    <div className="absolute -top-12 flex flex-col items-center animate-bounce z-10">
                                        <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-2 py-0.5 rounded-full mb-1 border border-yellow-200 shadow-sm">+30 PTS</span>
                                        <Trophy className="w-8 h-8 text-yellow-500 drop-shadow-md" fill="currentColor" />
                                    </div>
                                )}
                                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-2xl md:text-3xl font-black mb-4 shadow-inner border-2 ${match.snitchCaughtBy === 'home' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                    {match.homeTeam.substring(0, 1).toUpperCase()}
                                </div>
                                <h3 className="text-lg md:text-2xl font-bold text-slate-900 text-center leading-tight uppercase italic">{match.homeTeam}</h3>
                            </div>

                            {/* SCORE */}
                            <div className="flex flex-col items-center px-4">
                                <div className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                                    {match.homeScore}-{match.awayScore}
                                </div>
                                <div className={`mt-2 font-mono font-bold text-2xl flex items-center gap-2 ${isSnitchCaught ? 'text-slate-400' : 'text-red-500'}`}>
                                    {!isSnitchCaught && <Timer className="w-6 h-6" />}
                                    {displayTime}
                                </div>
                            </div>

                            {/* AWAY TEAM */}
                            <div className="flex flex-col items-center flex-1 relative">
                                {/* GOLDEN SNITCH INDICATOR (AWAY) */}
                                {match.snitchCaughtBy === 'away' && (
                                    <div className="absolute -top-12 flex flex-col items-center animate-bounce z-10">
                                        <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-2 py-0.5 rounded-full mb-1 border border-yellow-200 shadow-sm">+30 PTS</span>
                                        <Trophy className="w-8 h-8 text-yellow-500 drop-shadow-md" fill="currentColor" />
                                    </div>
                                )}
                                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-2xl md:text-3xl font-black mb-4 shadow-inner border-2 ${match.snitchCaughtBy === 'away' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-green-50 text-green-700 border-green-100'}`}>
                                    {match.awayTeam.substring(0, 1).toUpperCase()}
                                </div>
                                <h3 className="text-lg md:text-2xl font-bold text-slate-900 text-center leading-tight uppercase italic">{match.awayTeam}</h3>
                            </div>
                        </div>

                        {/* GAME OVER BANNER */}
                        {isSnitchCaught && (
                            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex flex-col items-center justify-center text-center">
                                <div className="flex items-center gap-2 text-yellow-800 font-black text-lg uppercase tracking-widest mb-1">
                                    <CheckCircle2 className="w-6 h-6" />
                                    Snitch Caught by {match.snitchCaughtBy === 'home' ? match.homeTeam : match.awayTeam}
                                </div>
                                <p className="text-yellow-700 text-sm font-medium">30 points awarded. Match concluded.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* --- LIVE COMMENTARY --- */}
                <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase italic tracking-tighter flex items-center gap-2">
                    Live <span className="text-blue-600">Commentary</span>
                </h3>

                <div className="space-y-3">
                    {sortedEvents.length > 0 ? (
                        sortedEvents.map((event, idx) => {
                            const isSnitch = event.type === 'snitch';
                            const isGoal = event.type === 'goal';
                            const isFoul = event.type === 'foul';

                            let cardStyle = "bg-white border-l-4 border-slate-300";
                            let badgeStyle = "bg-slate-100 text-slate-600";

                            if (isSnitch) {
                                cardStyle = "bg-yellow-50 border-l-4 border-yellow-500";
                                badgeStyle = "bg-yellow-200 text-yellow-900";
                            } else if (isGoal) {
                                cardStyle = "bg-white border-l-4 border-green-500";
                                badgeStyle = "bg-green-100 text-green-700";
                            } else if (isFoul) {
                                cardStyle = "bg-white border-l-4 border-red-500";
                                badgeStyle = "bg-red-100 text-red-700";
                            }

                            return (
                                <div key={idx} className={`p-4 rounded-lg shadow-sm flex items-start gap-4 transition-all hover:translate-x-1 ${cardStyle}`}>
                                    <div className="font-mono font-bold text-slate-400 text-sm min-w-[3rem] text-right mt-1">
                                        {event.time}'
                                    </div>
                                    <div className="flex-1">
                                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-1 ${badgeStyle}`}>
                                            {event.type}
                                        </span>
                                        <p className="font-bold text-slate-800 text-base leading-snug">{event.text}</p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="p-8 text-center text-slate-400 bg-white rounded-lg border border-slate-200 border-dashed">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            No events recorded yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MatchDetail;