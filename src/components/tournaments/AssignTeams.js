import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { ChevronLeft, Save, Users } from "lucide-react";
import tournamentService from '../../services/tournamentService';
import teamService from '../../services/teamService';

const AssignTeams = () => {
  const { tournamentId, matchId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [match, setMatch] = useState(null);
  const [allTeams, setAllTeams] = useState([]);
  
  const [selectedHomeId, setSelectedHomeId] = useState('');
  const [selectedAwayId, setSelectedAwayId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Carica dettagli del match per avere i dati attuali
        const matchData = await tournamentService.getMatchById(matchId);
        setMatch(matchData);
        setSelectedHomeId(matchData.homeTeamId ? String(matchData.homeTeamId) : '');
        setSelectedAwayId(matchData.awayTeamId ? String(matchData.awayTeamId) : '');

        // 2. Carica TUTTE le squadre registrate nel sistema
        const teamsDetails = await teamService.getAllTeams();
        
        // 3. Carica gli ID delle squadre che partecipano specificamente a questo torneo
        const participantIds = await tournamentService.getTeamsTorunamentId(tournamentId);
        
        // 4. Filtro: Mostriamo solo le squadre che sono iscritte a questo torneo
        // Usiamo String() per confrontare gli ID in modo sicuro (evita problemi Long vs String)
        const tournamentTeams = teamsDetails.filter(t => 
          participantIds.some(pId => String(pId) === String(t.id))
        );
        
        setAllTeams(tournamentTeams);

      } catch (err) {
        console.error("Error loading assignment data", err);
        setError("Failed to load tournament teams. Please check if teams are assigned to this tournament.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tournamentId, matchId]);

  const handleSave = async () => {
    // Validazione base
    if (!selectedHomeId || !selectedAwayId) {
      alert("Please select both teams for this match.");
      return;
    }
    if (String(selectedHomeId) === String(selectedAwayId)) {
      alert("A team cannot play against itself!");
      return;
    }

    try {
      setLoading(true);
      // Inviamo l'aggiornamento al backend. 
      // Poiché il backend è "blindato", usiamo la updateMatch standard.
      await tournamentService.updateMatch(matchId, {
        ...match,
        homeTeamId: selectedHomeId,
        awayTeamId: selectedAwayId
      });
      
      // Torniamo alla visualizzazione del torneo
      navigate('/tournaments');
    } catch (err) {
      console.error("Error saving match assignment", err);
      setError("Failed to save assignment. Check backend constraints.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !match) return <div className="p-10 text-center font-bold text-blue-600">Loading Tournament Teams...</div>;

  return (
    <div className="max-w-2xl mx-auto pt-10 px-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/tournaments')} 
        className="mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors"
      >
        <ChevronLeft size={20} /> Back to Bracket
      </Button>

      <Card className="shadow-2xl border-t-4 border-t-blue-600 bg-white">
        <CardHeader className="text-center border-b bg-slate-50/50">
          <CardTitle className="text-2xl font-black italic uppercase tracking-tighter flex justify-center items-center gap-3">
            <Users className="text-blue-600" /> Match Seeding
          </CardTitle>
          <p className="text-slate-500 text-sm mt-1">Assign teams for this specific match</p>
        </CardHeader>

        <CardContent className="p-8">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-200">{error}</div>}

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            {/* HOME TEAM SELECT */}
            <div className="w-full space-y-3">
              <Label className="font-black uppercase text-xs text-blue-600 tracking-widest">Home Team</Label>
              <select 
                className="w-full p-3 border-2 rounded-lg font-bold focus:border-blue-500 outline-none transition-all bg-white"
                value={selectedHomeId}
                onChange={(e) => setSelectedHomeId(e.target.value)}
              >
                <option value="">-- Choose Team --</option>
                {allTeams.map(t => (
                  <option key={t.id} value={t.id} disabled={String(t.id) === String(selectedAwayId)}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-center bg-slate-100 rounded-full p-4 border-2 border-white shadow-inner">
              <span className="font-black text-slate-400 italic text-xl">VS</span>
            </div>

            {/* AWAY TEAM SELECT */}
            <div className="w-full space-y-3">
              <Label className="font-black uppercase text-xs text-red-600 tracking-widest">Away Team</Label>
              <select 
                className="w-full p-3 border-2 rounded-lg font-bold focus:border-blue-500 outline-none transition-all bg-white"
                value={selectedAwayId}
                onChange={(e) => setSelectedAwayId(e.target.value)}
              >
                <option value="">-- Choose Team --</option>
                {allTeams.map(t => (
                  <option key={t.id} value={t.id} disabled={String(t.id) === String(selectedHomeId)}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="mt-10 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-700 leading-relaxed italic">
              * Only teams you previously added to this tournament are available for selection.
            </p>
          </div>
        </CardContent>

        <CardFooter className="p-6 bg-slate-50 border-t">
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold shadow-lg flex items-center justify-center gap-2"
          >
            <Save size={20} /> {loading ? "Saving..." : "Update Matchup"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AssignTeams;