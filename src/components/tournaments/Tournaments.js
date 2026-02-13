import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Trophy, Calendar, MapPin, ChevronLeft, Plus, Ticket, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import tournamentService from '../../services/tournamentService';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]); 
  const [selectedBracket, setSelectedBracket] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [loadingBracket, setLoadingBracket] = useState(false); // Added to manage bracket loading state
  const navigate = useNavigate();

  // Get user data from localStorage to check roles
  const user = JSON.parse(localStorage.getItem('user'));
  const isOrganizer = user?.roles?.includes('ROLE_ORGANIZATION_MANAGER');

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const data = await tournamentService.getAllTournaments();
      setTournaments(data);
    } catch (err) {
      console.error("Error fetching tournaments", err);
    } finally {
      setLoading(false);
    }
  };

  // function to group matches by round
  const formatMatchesToRounds = (matches) => {
    if (!matches || matches.length === 0) return [];
    
    const roundsMap = matches.reduce((acc, match) => {
      const r = match.round || 1; 
      if (!acc[r]) acc[r] = [];
      
      acc[r].push({
        id: match.id,
        teamA: match.homeTeamName || "TBD",
        teamB: match.awayTeamName || "TBD",
        scoreA: match.homeScore,
        scoreB: match.awayScore,
        winner: match.winnerTeamId,
        fullMatchData: match 
      });
      return acc;
    }, {});

    // Sort rounds and return as array of arrays
    return Object.keys(roundsMap)
      .sort((a, b) => Number(a) - Number(b))
      .map(key => roundsMap[key]);
  };

  const handleSelectTournament = async (tournament) => {
    setLoadingBracket(true); // Start loading specifically for the bracket
    try {
      // backend returns matches via /tournaments/{id}/matches
      const matches = await tournamentService.getMatchesTournamentId(tournament.id);

      // function to group matches by round for the bracket
      const rounds = formatMatchesToRounds(matches);
      
      // Setting selected bracket with formatted rounds
      setSelectedBracket({ ...tournament, rounds });
    } catch (err) {
        console.error("Error fetching matches", err);
    } finally {
        setLoadingBracket(false);
    }
  };

  const handleDeleteTournament = async (e, id) => {
      e.stopPropagation(); 
      if (window.confirm("Are you sure you want to delete this tournament and all associated matches?")) {
          try {
              await tournamentService.deleteTournament(id);
              setTournaments(tournaments.filter(t => t.id !== id));
          } catch (err) {
              console.error("Error deleting tournament", err);
              alert("Unable to delete tournament. Try again later.");
          }
      }
  };

  const handleMatchClick = (match) => {
    if (!match.teamA || !match.teamB) return; 

    // Sync navigation with App.js routes
    if (isOrganizer) {
      navigate(`/tournaments/match-editor/${match.id}`, { state: { match: match.fullMatchData } });
    } 
    else {
      navigate('/reservation', { state: { match: match.fullMatchData } });
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-blue-600 uppercase italic">Loading Tournaments...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {selectedBracket ? (
          /* --- VIEW B: BRACKET VIEW --- */
          <div>
            <Button 
              variant="ghost" 
              className="mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold" 
              onClick={() => setSelectedBracket(null)}
            >
              <ChevronLeft size={20} /> Back to Tournaments
            </Button>
            
            <h1 className="text-4xl font-black text-slate-900 mb-10 uppercase italic tracking-tighter">
              {selectedBracket.name} <span className="text-blue-600">Bracket</span>
            </h1>

            {loadingBracket ? (
              <div className="flex flex-col items-center py-20 text-slate-400">
                <Loader2 className="animate-spin mb-2" size={40} />
                <p className="italic font-medium">Fetching match data...</p>
              </div>
            ) : (
              <div className="flex gap-12 overflow-x-auto pb-10 custom-scrollbar">
                {selectedBracket.rounds && selectedBracket.rounds.length > 0 ? (
                  selectedBracket.rounds.map((roundMatches, roundIndex) => (
                    <div key={roundIndex} className="flex flex-col justify-around gap-8 min-w-[250px]">
                      <h3 className="text-center font-bold text-slate-400 uppercase text-xs tracking-widest border-b pb-2">
                        {getRoundName(roundIndex, selectedBracket.rounds.length)}
                      </h3>
                      {roundMatches.map((match) => (
                        <MatchCard 
                          key={match.id} 
                          match={match} 
                          onClick={() => handleMatchClick(match)} 
                        />
                      ))}
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center py-20 text-slate-400 italic font-medium">
                    No matches found for this tournament.
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* --- VIEW A: TOURNAMENTS LIST --- */
          <div>
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 uppercase italic tracking-tighter">
                <Trophy className="text-blue-600" size={40} /> Available Tournaments
              </h1>
              
              {isOrganizer && (
                <Button 
                  onClick={() => navigate('/tournaments/create')}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 shadow-lg font-bold"
                >
                  <Plus size={18} /> Create Tournament
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((t) => (
                <Card key={t.id} className="hover:border-blue-500 transition-all cursor-pointer group shadow-md bg-white relative overflow-hidden border-2">
                  <CardHeader className="flex flex-row items-start justify-between">
                    <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors uppercase italic pr-8">
                        {t.name}
                    </CardTitle>
                    {isOrganizer && (
                        <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all -mt-2 -mr-2"
                            onClick={(e) => handleDeleteTournament(e, t.id)}
                        >
                            <Trash2 size={18} />
                        </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <Calendar size={16} /> {t.startDate || "Date TBD"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                      <MapPin size={16} /> {t.location || "Location TBD"}
                    </div>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 mt-4 font-bold uppercase italic tracking-tight"
                      onClick={() => handleSelectTournament(t)} // FIX: passed the whole object 't'
                    >
                      View Bracket
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MatchCard = ({ match, onClick }) => {
  const isTBD = !match.teamA || !match.teamB;

  return (
    <Card 
      className={`shadow-md border-l-4 border-l-blue-600 bg-white min-w-[220px] transition-all ${!isTBD ? "cursor-pointer hover:scale-105 hover:shadow-xl" : "opacity-75"}`}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3 relative group">
        {!isTBD && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Ticket size={16} className="text-blue-600" />
          </div>
        )}
        
        <div className={`flex justify-between items-center ${match.winner === match.teamA ? "font-bold text-blue-700 underline" : "text-slate-600"}`}>
          <span className="truncate pr-2">{match.teamA || "TBD"}</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-sm">{match.scoreA ?? "-"}</span>
        </div>
        
        <div className={`flex justify-between items-center ${match.winner === match.teamB ? "font-bold text-blue-700 underline" : "text-slate-600"}`}>
          <span className="truncate pr-2">{match.teamB || "TBD"}</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-sm">{match.scoreB ?? "-"}</span>
        </div>

        {!isTBD && (
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter pt-1 text-center border-t border-slate-50">
            Click to manage/book
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const getRoundName = (index, total) => {
  if (index === total - 1) return "Final";
  if (index === total - 2) return "Semi-Finals";
  if (index === total - 3) return "Quarter-Finals";
  return `Round ${index + 1}`;
};

export default Tournaments;