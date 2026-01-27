import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Trophy, Calendar, MapPin, ChevronLeft, Plus, Ticket } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import tournamentService from '../../services/tournamentService';
import { hasRole } from '../../services/authService';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]); 
  const [selectedBracket, setSelectedBracket] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check roles using our utility
  const isOrganizer = hasRole('ROLE_ORGANIZATION_MANAGER');

  // Load all tournaments on mount
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

  const handleSelectTournament = async (id) => {
    setLoading(true);
    try {
      // Calling the list of lists endpoint (bracket)
      const data = await tournamentService.getTournamentBracket(id);
      setSelectedBracket(data);
    } catch (err) {
      console.error("Error fetching bracket", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchClick = (match) => {
    // If the match isn't scheduled yet (missing teams), do nothing
    if (!match.homeTeamId || !match.awayTeamId) return; 

    if (isOrganizer) {
      // MANAGER VIEW -> Go to Editor
      navigate(`/tournaments/match/${match.id}/edit`, { state: { match } });
    } else {
      // SPECTATOR VIEW -> Go to Booking/Details
      navigate('/reservation', { state: { match } });
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-2xl font-black text-blue-600 animate-pulse tracking-tighter">
        LOADING QUADBALL DATA...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {selectedBracket ? (
          <div>
            <Button 
              variant="ghost" 
              className="mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600" 
              onClick={() => setSelectedBracket(null)}
            >
              <ChevronLeft size={20} /> Back to Tournaments
            </Button>
            
            <h1 className="text-4xl font-black text-slate-900 mb-10 uppercase italic tracking-tighter">
              Tournament <span className="text-blue-600">Bracket</span>
            </h1>

            <div className="flex gap-12 overflow-x-auto pb-10 custom-scrollbar">
              {selectedBracket.map((roundMatches, roundIndex) => (
                <div key={roundIndex} className="flex flex-col justify-around gap-8 min-w-[280px]">
                  <h3 className="text-center font-bold text-slate-400 uppercase text-xs tracking-widest border-b pb-2">
                    {getRoundName(roundIndex, selectedBracket.length)}
                  </h3>
                  {roundMatches.map((match) => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      onClick={() => handleMatchClick(match)} 
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* --- VIEW: TOURNAMENTS LIST --- */
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
                  <Plus size={18} /> New Tournament
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.length > 0 ? (
                tournaments.map((t) => (
                  <Card key={t.id} className="hover:border-blue-500 transition-all cursor-pointer group shadow-md bg-white border-t-4 border-t-transparent hover:border-t-blue-600">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors uppercase italic">
                        {t.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Calendar size={16} /> {t.startDate ? `${t.startDate} to ${t.endDate}` : "Dates TBD"}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <MapPin size={16} /> {t.location || "Location TBD"}
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 mt-4 font-bold"
                        onClick={() => handleSelectTournament(t.id)}
                      >
                        View Bracket
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-slate-400">
                  <p className="text-xl font-medium">No tournaments available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const MatchCard = ({ match, onClick }) => {
  // Using homeTeamName and awayTeamName from your backend DTO
  const isTBD = !match.homeTeamName || !match.awayTeamName;

  return (
    <Card 
      className={`shadow-md border-l-4 border-l-blue-600 bg-white min-w-[240px] transition-all ${!isTBD ? "cursor-pointer hover:scale-105 hover:shadow-xl" : "opacity-75"}`}
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-3 relative group">
        {!isTBD && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Ticket size={16} className="text-blue-600" />
          </div>
        )}
        
        <div className={`flex justify-between items-center ${match.homeScore > match.awayScore ? "font-bold text-blue-700" : "text-slate-600"}`}>
          <span className="truncate pr-2">{match.homeTeamName || "TBD"}</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-sm">{match.homeScore ?? "-"}</span>
        </div>
        
        <div className={`flex justify-between items-center ${match.awayScore > match.homeScore ? "font-bold text-blue-700" : "text-slate-600"}`}>
          <span className="truncate pr-2">{match.awayTeamName || "TBD"}</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-sm">{match.awayScore ?? "-"}</span>
        </div>

        {/* Display Snitch Catch if applicable */}
        {match.snitchCaughtByTeamId && (
            <div className="flex items-center justify-center gap-1 text-[9px] text-yellow-600 font-bold uppercase pt-1 border-t">
                <Trophy size={10} /> Snitch Caught
            </div>
        )}

        {!isTBD && (
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter pt-1 text-center">
            Click to Manage / Book
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