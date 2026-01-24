import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Trophy, Calendar, MapPin, ChevronLeft, Plus, Ticket } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState([]); 
  const [selectedBracket, setSelectedBracket] = useState(null); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get user data from localStorage to check roles
  const user = JSON.parse(localStorage.getItem('user'));
  const isOrganizer = user?.role === 'ROLE_ORGANIZATION_MANAGER';

  useEffect(() => {
   /* axios.get('http://localhost:8080/api/tournaments')
      .then(res => {
        setTournaments(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tournaments", err);
        setLoading(false);
      });
  }, []);*/
//togli da qua
  setTournaments([
    { id: 1, name: "Summer Quadball Cup", date: "2024-06-01", location: "Rome" }
  ]);
  setLoading(false);
}, []);
//a qua


//togli da qua 
  const handleSelectTournament = (id) => {
  setLoading(true);
  // Simuliamo un ritardo del server di 500ms
  setTimeout(() => {
    setSelectedBracket(MOCK_BRACKET);
    setLoading(false);
  }, 500);
};
//a qua

  //const handleSelectTournament = (id) => {
  //  setLoading(true);
  //  axios.get(`http://localhost:8080/api/tournaments/${id}/bracket`)
  //    .then(res => {
  //      setSelectedBracket(res.data);
  //      setLoading(false);
  //    })
  //    .catch(err => {
  //      console.error("Error fetching bracket", err);
  //      setLoading(false);
  //    });
  //};

  // Funzione per gestire il click sul match e andare alla prenotazione
  const handleMatchClick = (match) => {
    if (!match.teamA || !match.teamB) return; // Evita prenotazioni per match TBD

    // Passiamo i dati necessari alla pagina di prenotazione
    navigate('/reservation', { 
      state: { 
        match: {
          id: match.id,
          teamA: match.teamA,
          teamB: match.teamB,
          date: match.date || "Scheduled",
          stadiumName: match.stadiumName || "Arena Principal",
          stadiumId: match.stadiumId
        } 
      } 
    });
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
              {selectedBracket.map((roundMatches, roundIndex) => (
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
              ))}
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
                <Card key={t.id} className="hover:border-blue-500 transition-all cursor-pointer group shadow-md bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors uppercase italic">{t.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar size={16} /> {t.date || "Date TBD"}
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

// Componente MatchCard aggiornato con click per prenotazione
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
            Click to book seats
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

//togli la prova da qua
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
//a qua


export default Tournaments;