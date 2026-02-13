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
    if (window.confirm("Sei sicuro di voler eliminare questo torneo e tutti i match associati?")) {
      try {
        await tournamentService.deleteTournament(id);
        setTournaments(tournaments.filter(t => t.id !== id));
      } catch (err) {
        console.error("Error deleting tournament", err);
        alert("Impossibile eliminare il torneo.");
      }
    }
  };

  const handleSelectTournament = async (id) => {
    setLoading(true);
    try {
      const matches = await tournamentService.getMatchesTournamentId(id);
      const organizedBracket = organizeMatchesIntoRounds(matches);
      setSelectedBracket(organizedBracket);
    } catch (err) {
      console.error("Error fetching matches", err);
    } finally {
      setLoading(false);
    }
  };

  const organizeMatchesIntoRounds = (matches) => {
    if (!matches || matches.length === 0) return [];
    
    // Raggruppa i match per round usando un oggetto per evitare indici vuoti
    const roundsMap = matches.reduce((acc, m) => {
      const r = m.round || 0;
      if (!acc[r]) acc[r] = [];
      acc[r].push(m);
      return acc;
    }, {});

    // Converte l'oggetto in un array ordinato per numero di round
    return Object.keys(roundsMap)
      .sort((a, b) => a - b)
      .map(key => roundsMap[key].sort((a, b) => (a.bracketIndex || 0) - (b.bracketIndex || 0)));
  };

  const handleMatchClick = (match) => {
    // Portiamo l'utente alla pagina dei Match dove può prenotare o editare
    // Passiamo il match come stato per permettere al componente di evidenziarlo o aprire la modale
    navigate('/matches', { state: { selectedMatchId: match.id } });
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center font-black text-blue-600 uppercase italic tracking-tighter">
      <Loader2 className="animate-spin mb-2" size={40} />
      Loading Arena...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {selectedBracket ? (
          <div className="animate-in fade-in duration-500">
            <Button 
              variant="ghost" 
              className="mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 font-bold uppercase text-xs" 
              onClick={() => setSelectedBracket(null)}
            >
              <ChevronLeft size={20} /> Back to Tournaments
            </Button>
            
            <h1 className="text-4xl font-black text-slate-900 mb-10 uppercase italic tracking-tighter">
              Tournament <span className="text-blue-600">Bracket</span>
            </h1>

            <div className="flex gap-12 overflow-x-auto pb-10 custom-scrollbar">
              {selectedBracket.length > 0 ? (
                selectedBracket.map((roundMatches, roundIndex) => (
                  <div key={roundIndex} className="flex flex-col justify-around gap-8 min-w-[280px]">
                    <h3 className="text-center font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] border-b border-slate-200 pb-2">
                      {getRoundName(roundIndex, selectedBracket.length)}
                    </h3>
                    {roundMatches.map((match, mIdx) => (
                      <MatchCard 
                        key={match.id || mIdx} 
                        match={match} 
                        onClick={() => handleMatchClick(match)} 
                      />
                    ))}
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-20 text-slate-400 italic font-medium">
                  No bracket matches generated yet.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* --- VIEW A: TOURNAMENTS LIST --- */
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                <h1 className="text-5xl font-black text-slate-900 flex items-center gap-3 uppercase italic tracking-tighter">
                  <Trophy className="text-blue-600" size={48} /> Tournaments
                </h1>
                <p className="text-slate-500 font-medium mt-2 uppercase text-xs tracking-widest">Select an event to view the bracket</p>
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
                            className="text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all"
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
                      onClick={() => handleSelectTournament(t.id)}
                    >
                      Enter Bracket
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


const MatchCard = ({ match, onClick }) => {
  const isTBD = !match.homeTeamId || !match.awayTeamId; // Usiamo gli ID del backend

  return (
    <Card 
      className={`shadow-lg border-none bg-white transition-all overflow-hidden ${!isTBD ? "cursor-pointer hover:ring-2 hover:ring-blue-600 hover:shadow-2xl" : "opacity-60"}`}
      onClick={onClick}
    >
      <div className="bg-slate-900 p-2 text-[8px] font-black text-slate-400 flex justify-between uppercase tracking-widest">
        <span>Match #{match.id || "???"}</span>
        {match.date && <span>{match.date}</span>}
      </div>
      <CardContent className="p-4 space-y-4 relative group">
        <div className="space-y-2">
            <div className={`flex justify-between items-center ${match.homeScore > match.awayScore ? "font-black text-blue-600" : "font-bold text-slate-700"}`}>
                <span className="truncate pr-2 uppercase italic text-sm">{match.homeTeamName || "Home Team"}</span>
                <span className="bg-slate-100 px-2 py-1 rounded font-mono text-xs border border-slate-200">
                    {match.homeScore ?? "-"}
                </span>
            </div>
            
            <div className={`flex justify-between items-center ${match.awayScore > match.homeScore ? "font-black text-blue-600" : "font-bold text-slate-700"}`}>
                <span className="truncate pr-2 uppercase italic text-sm">{match.awayTeamName || "Away Team"}</span>
                <span className="bg-slate-100 px-2 py-1 rounded font-mono text-xs border border-slate-200">
                    {match.awayScore ?? "-"}
                </span>
            </div>
        </div>

        {!isTBD && (
          <div className="flex items-center justify-center gap-1 text-[9px] text-blue-600 font-black uppercase tracking-tighter pt-2 border-t border-slate-50">
            <Ticket size={10} /> View Match Details
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const getRoundName = (index, total) => {
  if (index === total - 1) return "The Grand Final";
  if (index === total - 2) return "Semi-Finals";
  if (index === total - 3) return "Quarter-Finals";
  return `Round ${index + 1}`;
};

export default Tournaments;