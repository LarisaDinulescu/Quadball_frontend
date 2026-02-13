import React, { useEffect, useState } from "react";
import matchService from "../../services/matchService"; 
import teamService from "../../services/teamService"; 
import { hasRole } from "../../services/authService";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Plus, Trash2, Loader2, Calendar, Edit } from "lucide-react";
import MatchForm from "./MatchForm"; 

export default function MatchManagement() {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);

  const isManager = hasRole('ROLE_ORGANIZATION_MANAGER');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchData, teamData] = await Promise.all([
        matchService.getAllMatches(),
        teamService.getAllTeams() 
      ]);
      
      const teamMap = {};
      teamData.forEach(t => teamMap[t.id] = t.name);
      
      setTeams(teamMap);
      setMatches(matchData);
    } catch (err) {
      console.error("Errore nel caricamento dati", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const handleDelete = async (id) => {
    if (window.confirm("Sei sicuro di voler eliminare questo match?")) {
      try {
        await matchService.deleteMatch(id);
        fetchData();
      } catch (err) {
        alert("Errore durante l'eliminazione.");
      }
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const upcomingMatches = matches.filter(m => m.date >= today); // future matches
  const pastMatches = matches.filter(m => m.date < today);    // finished matches

  const MatchCard = ({ match, isPast }) => (
    <Card className={`bg-white border-none shadow-md border-t-4 ${isPast ? 'border-slate-300' : 'border-indigo-600'}`}>
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar size={14} />
            <span className="text-[10px] font-bold uppercase">{match.date}</span>
          </div>
          {isManager && !isPast && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => { setEditingMatch(match); setIsDialogOpen(true); }}>
                <Edit size={18} className="text-slate-300 hover:text-indigo-600"/>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(match.id)}>
                <Trash2 size={18} className="text-slate-300 hover:text-red-600"/>
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between font-black text-lg text-slate-800 uppercase italic">
          <span className="flex-1 text-left">{teams[match.homeTeamId] || "TBD"}</span>
          <span className="px-4 text-indigo-600 text-xs font-bold">VS</span>
          <span className="flex-1 text-right">{teams[match.awayTeamId] || "TBD"}</span>
        </div>

        {isPast && (
          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-center">
            <div className="text-center bg-slate-100 px-4 py-1 rounded-full">
              <p className="text-lg font-black text-slate-600">
                {match.homeScore} - {match.awayScore}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) return (
    <div className="p-10 text-center font-bold text-indigo-600 uppercase tracking-widest">
      <Loader2 className="animate-spin inline mr-2"/> Loading Matches...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">Matches</h1>
          {isManager && (
            <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if(!v) setEditingMatch(null); }}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 text-white font-bold shadow-lg">
                  <Plus size={20} className="mr-2"/> New Match
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                   <DialogTitle className="uppercase italic font-bold text-indigo-900">
                     {editingMatch ? "Edit Match" : "Schedule Match"}
                   </DialogTitle>
                </DialogHeader>
                <MatchForm initialData={editingMatch} onSuccess={() => { setIsDialogOpen(false); fetchData(); }} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <section className="mb-12">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-6 border-l-4 border-indigo-600 pl-3">Upcoming Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.length > 0 ? upcomingMatches.map(m => <MatchCard key={m.id} match={m} isPast={false} />) : <p className="text-slate-400 italic">No matches scheduled.</p>}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-l-4 border-slate-300 pl-3">Past Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastMatches.map(m => <MatchCard key={m.id} match={m} isPast={true} />)}
          </div>
        </section>
      </div>
    </div>
  );
}