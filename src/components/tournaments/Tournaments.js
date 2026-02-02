import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Trophy, Calendar, MapPin, ChevronLeft, Plus, Ticket, Trash2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import tournamentService from '../../services/tournamentService';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]); 
  const [selectedBracket, setSelectedBracket] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get user data from localStorage to check roles
  const user = JSON.parse(localStorage.getItem('user'));
  
  // MODIFICA: Controllo coerenza con app.js (usa .roles array invece di .role string)
  const isOrganizer = user?.roles?.includes('ROLE_ORGANIZATION_MANAGER');

    useEffect(() => {
        // SOSTITUITO: Chiamata reale al backend
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
        fetchTournaments();
    }, []);

    const handleDeleteTournament = async (e, id) => {
        e.stopPropagation(); // Evita che il click apra il bracket
        if (window.confirm("Sei sicuro di voler eliminare questo torneo e tutti i match associati?")) {
            try {
                await tournamentService.deleteTournament(id);
                setTournaments(tournaments.filter(t => t.id !== id));
            } catch (err) {
                console.error("Error deleting tournament", err);
                alert("Impossibile eliminare il torneo. Riprova più tardi.");
            }
        }
    };

    const handleSelectTournament = async (id) => {
        setLoading(true);
        try {
            // Nota: Il tuo backend ritorna i match con /tournaments/{id}/matches
            const matches = await tournamentService.getMatchesTournamentId(id);

            // Funzione per raggruppare i match in round per il bracket
            const organizedBracket = organizeMatchesIntoRounds(matches);
            setSelectedBracket(organizedBracket);
        } catch (err) {
            console.error("Error fetching matches", err);
        } finally {
            setLoading(false);
        }
    };

    const organizeMatchesIntoRounds = (matches) => {
        const rounds = [];
        if (!matches || matches.length === 0) return [];

        matches.forEach(m => {
            const rIndex = m.round;
            if (!rounds[rIndex]) rounds[rIndex] = [];
            rounds[rIndex].push(m);
        });

        rounds.forEach(round => {
            round.sort((a, b) => a.bracketIndex - b.bracketIndex);
        });

        return rounds;
    };

  const handleMatchClick = (match) => {
    if (!match.teamA || !match.teamB) return; 

    if (isOrganizer) {
      navigate(`/tournaments/match/${match.id}/edit`, { state: { match } });
    } 
    else {
      navigate('/reservation', { state: { match } });
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-blue-600">Loading...</div>;

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
              {selectedBracket.length > 0 ? (
                selectedBracket.map((roundMatches, roundIndex) => (
                  <div key={roundIndex} className="flex flex-col justify-around gap-8 min-w-[250px]">
                    <h3 className="text-center font-bold text-slate-400 uppercase text-xs tracking-widest border-b pb-2">
                      {getRoundName(roundIndex, selectedBracket.length)}
                    </h3>
                    {roundMatches.map((match, mIdx) => (
                      <MatchCard 
                        key={mIdx} 
                        match={match} 
                        onClick={() => handleMatchClick(match)} 
                      />
                    ))}
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-20 text-slate-400 italic">
                  No bracket generated for this tournament yet.
                </div>
              )}
            </div>
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
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 shadow-lg"
                >
                  <Plus size={18} /> Create Tournament
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((t) => (
                <Card key={t.id} className="hover:border-blue-500 transition-all cursor-pointer group shadow-md bg-white relative overflow-hidden">
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
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar size={16} /> {t.startDate || "Date TBD"}
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
        
        <div className={`flex justify-between items-center ${match.winner === match.teamA ? "font-bold text-blue-700" : "text-slate-600"}`}>
          <span className="truncate pr-2">{match.teamA || "TBD"}</span>
          <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-sm">{match.scoreA ?? "-"}</span>
        </div>
        
        <div className={`flex justify-between items-center ${match.winner === match.teamB ? "font-bold text-blue-700" : "text-slate-600"}`}>
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

const MOCK_BRACKET = [
  // Round 1 (Semi-Finals)
  [
    { id: 101, teamA: "Gryffindor", teamB: "Slytherin", scoreA: 150, scoreB: 40, winner: "Gryffindor", date: "2024-06-01", stadiumName: "Hogwarts Arena", stadiumId: 1 },
    { id: 102, teamA: "Ravenclaw", teamB: "Hufflepuff", scoreA: 70, scoreB: 120, winner: "Hufflepuff", date: "2024-06-02", stadiumName: "Quidditch Pitch", stadiumId: 2 }
  ],
  // Round 2 (Final)
  [
    { id: 103, teamA: "Gryffindor", teamB: "Hufflepuff", scoreA: null, scoreB: null, date: "2024-06-10", stadiumName: "Grand Stadium", stadiumId: 3 }
  ]
];

export default Tournaments;