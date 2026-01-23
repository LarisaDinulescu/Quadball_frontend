import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Trophy, Calendar, MapPin, ChevronLeft, Plus } from "lucide-react";
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
    axios.get('http://localhost:8080/api/tournaments')
      .then(res => {
        setTournaments(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching tournaments", err);
        setLoading(false);
      });
  }, []);

  const handleSelectTournament = (id) => {
    setLoading(true);
    axios.get(`http://localhost:8080/api/tournaments/${id}/bracket`)
      .then(res => {
        setSelectedBracket(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching bracket", err);
        setLoading(false);
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
              className="mb-6 flex items-center gap-2" 
              onClick={() => setSelectedBracket(null)}
            >
              <ChevronLeft size={20} /> Back to Tournaments
            </Button>
            
            <h1 className="text-4xl font-black text-slate-900 mb-10 uppercase italic">
              Tournament <span className="text-blue-600">Bracket</span>
            </h1>

            <div className="flex gap-12 overflow-x-auto pb-10 custom-scrollbar">
              {selectedBracket.map((roundMatches, roundIndex) => (
                <div key={roundIndex} className="flex flex-col justify-around gap-8 min-w-[220px]">
                  <h3 className="text-center font-bold text-slate-400 uppercase text-xs tracking-widest border-b pb-2">
                    {getRoundName(roundIndex, selectedBracket.length)}
                  </h3>
                  {roundMatches.map((match, mIdx) => (
                    <MatchCard key={mIdx} match={match} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* --- VIEW A: TOURNAMENTS LIST --- */
          <div>
            <div className="flex justify-between items-center mb-10">
              <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3 uppercase italic">
                <Trophy className="text-blue-600" size={40} /> Available Tournaments
              </h1>
              
              {/* Button visible ONLY for Organizers */}
              {isOrganizer && (
                <Button 
                  onClick={() => navigate('/tournaments/create')}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={18} /> Create Tournament
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((t) => (
                <Card key={t.id} className="hover:border-blue-500 transition-all cursor-pointer group shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-blue-600">{t.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar size={16} /> {t.date || "Date TBD"}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <MapPin size={16} /> {t.location || "Location TBD"}
                    </div>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
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

const MatchCard = ({ match }) => (
  <Card className="shadow-md border-l-4 border-l-blue-600 bg-white min-w-[200px]">
    <CardContent className="p-4 space-y-3">
      <div className={`flex justify-between items-center ${match.winner === match.teamA ? "font-bold text-blue-700" : "text-slate-600"}`}>
        <span>{match.teamA || "TBD"}</span>
        <span className="bg-slate-100 px-2 rounded font-mono">{match.scoreA ?? "-"}</span>
      </div>
      <div className={`flex justify-between items-center ${match.winner === match.teamB ? "font-bold text-blue-700" : "text-slate-600"}`}>
        <span>{match.teamB || "TBD"}</span>
        <span className="bg-slate-100 px-2 rounded font-mono">{match.scoreB ?? "-"}</span>
      </div>
    </CardContent>
  </Card>
);

const getRoundName = (index, total) => {
  if (index === total - 1) return "Final";
  if (index === total - 2) return "Semi-Finals";
  return `Round ${index + 1}`;
};

export default Tournaments;