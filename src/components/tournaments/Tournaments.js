import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Trophy, Calendar, MapPin, ChevronLeft, Plus, Ticket, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import tournamentService from '../../services/tournamentService';

const Tournaments = () => {
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [bracketRounds, setBracketRounds] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user'));
    const isOrganizer = user?.roles?.includes('ROLE_ORGANIZATION_MANAGER');

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        setLoading(true);
        try {
            const data = await tournamentService.getAllTournaments();
            setTournaments(data);
        } catch (err) {
            console.error("Error fetching tournaments", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTournament = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this tournament and all its matches?")) {
            try {
                await tournamentService.deleteTournament(id);
                setTournaments(tournaments.filter(t => t.id !== id));
            } catch (err) {
                console.error("Error deleting tournament", err);
                alert("Cannot delete the tournament.");
            }
        }
    };

    const handleSelectTournament = async (tournament) => {
        setLoading(true);
        try {
            const enrichedMatches = await tournamentService.getEnrichedTournamentMatches(tournament.id);
            const organizedRounds = organizeBracket(enrichedMatches);

            setBracketRounds(organizedRounds);
            setSelectedTournament(tournament);
        } catch (err) {
            console.error("Error fetching enriched matches", err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateBracket = async (tournamentId) => {
        setLoading(true);
        try {
            await tournamentService.generateBracket(tournamentId);
            await handleSelectTournament(selectedTournament);
        } catch (error) {
            console.error("Error generating bracket", error);
            alert("Failed to generate bracket. Make sure teams are assigned.");
            setLoading(false);
        }
    };

    const organizeBracket = (matches) => {
        if (!matches || matches.length === 0) return [];

        const roundsMap = matches.reduce((acc, match) => {
            const r = match.round || 1;
            if (!acc[r]) acc[r] = [];
            acc[r].push(match);
            return acc;
        }, {});

        const maxRound = Math.max(...Object.keys(roundsMap).map(Number));
        const sortedRounds = [];

        for (let i = 1; i <= maxRound; i++) {
            if (roundsMap[i]) {
                sortedRounds.push(roundsMap[i].sort((a, b) => (a.bracketIndex || 0) - (b.bracketIndex || 0)));
            } else {
                sortedRounds.push([]);
            }
        }

        return sortedRounds;
    };

    if (loading && !selectedTournament) return (
        <div className="flex h-screen flex-col items-center justify-center font-black text-blue-600 uppercase italic tracking-tighter bg-slate-50">
            <Loader2 className="animate-spin mb-2" size={40} />
            Loading Arena...
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 p-8 overflow-hidden flex flex-col">
            <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col">

                {selectedTournament ? (
                    /* --- VIEW B: BRACKET GRAFICO --- */
                    <div className="animate-in fade-in duration-500 flex flex-col h-full">
                        <div className="mb-8 shrink-0">
                            <Button
                                variant="ghost"
                                className="mb-4 flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold uppercase text-xs"
                                onClick={() => { setSelectedTournament(null); setBracketRounds([]); }}
                            >
                                <ChevronLeft size={20} /> Back to Tournaments
                            </Button>

                            <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
                                {selectedTournament.name} <span className="text-blue-600">Bracket</span>
                            </h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">
                                Road to the final
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40}/></div>
                        ) : bracketRounds.length > 0 ? (
                            /* CONTENITORE BRACKET ORIZZONTALE */
                            <div className="flex-1 overflow-x-auto overflow-y-auto pb-10 bg-white rounded-3xl border shadow-inner p-8 custom-scrollbar">
                                <div className="flex min-w-max gap-16 justify-start items-center h-full">
                                    {bracketRounds.map((roundMatches, roundIndex) => (
                                        <div key={roundIndex} className="flex flex-col justify-around h-full min-w-[300px] relative">
                                            {/* Titolo del Round */}
                                            <div className="absolute -top-6 left-0 right-0 text-center font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] pb-2">
                                                {getRoundName(roundIndex, bracketRounds.length)}
                                            </div>

                                            {/* Partite della colonna */}
                                            {roundMatches.map((match, mIdx) => (
                                                <div key={match.id || mIdx} className="relative py-4 flex flex-col justify-center">
                                                    {/* RIMOSSA LA FUNZIONE onClick */}
                                                    <BracketMatchCard match={match} />

                                                    {/* Linee di Connessione CSS */}
                                                    {roundIndex < bracketRounds.length - 1 && (
                                                        <>
                                                            <div className="absolute right-[-2rem] top-1/2 w-8 border-t-2 border-slate-300"></div>

                                                            {(mIdx % 2 === 0) ? (
                                                                <div className="absolute right-[-2rem] top-1/2 bottom-[-50%] border-r-2 border-slate-300 rounded-tr-lg"></div>
                                                            ) : (
                                                                <div className="absolute right-[-2rem] top-[-50%] bottom-1/2 border-r-2 border-slate-300 rounded-br-lg"></div>
                                                            )}

                                                            {(mIdx % 2 === 0) && (
                                                                <div className="absolute right-[-4rem] top-[100%] w-8 border-t-2 border-slate-300 z-0 hidden lg:block"></div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-20 rounded-3xl border border-dashed text-center text-slate-400 font-bold uppercase tracking-widest shadow-sm flex flex-col items-center">
                                <Trophy size={48} className="mb-4 opacity-50"/>
                                No bracket generated yet.
                                {isOrganizer && (
                                    <Button
                                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                        onClick={() => handleGenerateBracket(selectedTournament.id)}
                                    >
                                        Generate Bracket Now
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    /* --- VIEW A: TOURNAMENTS LIST --- */
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                            <div>
                                <h1 className="text-5xl font-black text-slate-900 flex items-center gap-3 uppercase italic tracking-tighter">
                                    <Trophy className="text-blue-600" size={48} /> Tournaments
                                </h1>
                                <p className="text-slate-500 font-medium mt-2 uppercase text-xs tracking-widest">Select an event to view the brackets</p>
                            </div>

                            {isOrganizer && (
                                <Button
                                    onClick={() => navigate('/tournaments/create')}
                                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 shadow-xl font-black uppercase italic tracking-tighter px-6 py-6"
                                >
                                    <Plus size={18} /> Create Tournament
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {tournaments.length > 0 ? tournaments.map((t) => (
                                <Card key={t.id} className="hover:border-blue-500 transition-all cursor-pointer group shadow-xl bg-white relative overflow-hidden border-none">
                                    <div className="h-1.5 bg-slate-200 group-hover:bg-blue-600 transition-colors" />
                                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                                        <CardTitle className="text-2xl font-black group-hover:text-blue-600 transition-colors uppercase italic pr-8 tracking-tighter">
                                            {t.name}
                                        </CardTitle>
                                        {isOrganizer && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all z-10"
                                                onClick={(e) => handleDeleteTournament(e, t.id)}
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        )}
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                                <Calendar size={14} className="text-blue-500" /> {t.startDate || "Date TBD"}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                                <MapPin size={14} className="text-blue-500" /> {t.location || "Arena TBD"}
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full bg-slate-900 hover:bg-blue-600 mt-4 font-black uppercase italic tracking-widest transition-all py-6"
                                            onClick={() => handleSelectTournament(t)}
                                        >
                                            View Bracket
                                        </Button>
                                    </CardContent>
                                </Card>
                            )) : (
                                <div className="col-span-full py-20 text-center text-slate-400 font-bold uppercase tracking-widest border-2 border-dashed rounded-2xl">
                                    No active tournaments found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Componente Card per il singolo MATCH nel Tabellone (ORA STATICO)
const BracketMatchCard = ({ match }) => {
    const homeScore = match.homeScore ?? null;
    const awayScore = match.awayScore ?? null;
    const isPlayed = homeScore !== null && awayScore !== null;

    const isTBD = !match.homeTeamName && !match.awayTeamName;

    return (
        <Card
            // Rimosse classi hover, cursor-pointer e animazioni
            className={`relative z-10 w-[280px] shadow-sm border-2 bg-white overflow-hidden ${
                isPlayed ? "border-green-400" : isTBD ? "border-slate-200 opacity-60" : "border-slate-300"
            }`}
        >
            <div className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest flex justify-between ${isPlayed ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                <span>{isPlayed ? "Final Score" : "Upcoming"}</span>
                <span>Match #{match.matchId || match.id || "TBD"}</span>
            </div>

            <div className="flex flex-col p-0">
                {/* Squadra di Casa */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100">
            <span className={`truncate pr-2 uppercase italic text-sm ${homeScore > awayScore ? "font-black text-slate-900" : "font-semibold text-slate-600"}`}>
                {match.homeTeamName || "TBA"}
            </span>
                    <span className={`px-2 py-0.5 rounded font-mono text-sm font-bold ${homeScore > awayScore ? 'bg-green-100 text-green-700' : 'text-slate-400'}`}>
                {homeScore ?? "-"}
            </span>
                </div>

                {/* Squadra in Trasferta */}
                <div className="flex justify-between items-center px-4 py-3">
            <span className={`truncate pr-2 uppercase italic text-sm ${awayScore > homeScore ? "font-black text-slate-900" : "font-semibold text-slate-600"}`}>
                {match.awayTeamName || "TBA"}
            </span>
                    <span className={`px-2 py-0.5 rounded font-mono text-sm font-bold ${awayScore > homeScore ? 'bg-green-100 text-green-700' : 'text-slate-400'}`}>
                {awayScore ?? "-"}
            </span>
                </div>
            </div>
        </Card>
    );
};

// Helper per i nomi dei round del tabellone
const getRoundName = (index, totalRounds) => {
    if (totalRounds === 0) return "";
    const diff = totalRounds - index - 1;

    if (diff === 0) return "Final";
    if (diff === 1) return "Semi-Finals";
    if (diff === 2) return "Quarter-Finals";
    return `Round ${index + 1}`;
};

export default Tournaments;