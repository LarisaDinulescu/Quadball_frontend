import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import teamService from "../../services/teamService";
import { hasRole } from "../../services/authService"; 
import playerService from "../../services/playerService"; 
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Shield, ChevronLeft, Users, Trophy, MapPin, Loader2, UserPlus } from "lucide-react";

export default function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // define permission to add a player in the team
  const Manager = hasRole('ROLE_ORGANIZATION_MANAGER') || hasRole('ROLE_TEAM_MANAGER');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // team details
        const teamData = await teamService.getTeamById(id);
        setTeam(teamData);

        // get all players of the current team_id
        const allPlayers = await playerService.getAllPlayers();
        const teamPlayers = allPlayers.filter(p => String(p.team_id) === String(id));
        setPlayers(teamPlayers);
        
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
    </div>
  );

  if (!team) return <div className="p-20 text-center font-black">TEAM NOT FOUND</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/teams")} 
          className="mb-8 gap-2 text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest text-xs"
        >
          <ChevronLeft size={20} /> Back to League
        </Button>

        {/* Header Team */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12 bg-white p-8 rounded-3xl shadow-xl border-b-8 border-indigo-600">
          <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg">
            <Shield size={64} />
          </div>
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-6xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
              {team.name}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-2 text-slate-400 font-bold uppercase tracking-widest text-xs">
              <span className="flex items-center gap-1"><MapPin size={14} /> {team.city}</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-indigo-600 italic">Official Organization</span>
            </div>
          </div>
          
          {/* Button to add another player */}
          {Manager && (
          <Button 
            onClick={() => navigate("/player/create", { state: { teamId: id } })}
            className="bg-slate-900 hover:bg-indigo-600 text-white gap-2 font-black uppercase text-xs tracking-widest px-6"
          >
            <UserPlus size={18} /> Add Player
          </Button>)}
        </div>

        {/* Roster list */}
        <Card className="border-none shadow-2xl bg-white overflow-hidden rounded-3xl">
          <CardHeader className="bg-slate-900 text-white p-6">
            <CardTitle className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
              <Trophy className="text-yellow-400" /> Active Roster ({players.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {players.length > 0 ? (
                players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all group">
                    <div className="flex items-center gap-5">
                      {/* Jersey Number */}
                      <div className="w-14 h-14 bg-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors rounded-2xl flex items-center justify-center font-black text-xl text-slate-400 shadow-inner">
                        {player.jerseyNumber}
                      </div>
                      <div>
                        <p className="font-black uppercase text-xl text-slate-900 tracking-tighter">
                          {player.name}
                        </p>
                        <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">
                          {player.position}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                       <Button variant="ghost" className="font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-indigo-600">
                        Details
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-24 text-center">
                  <Users size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-black uppercase tracking-widest italic">No players assigned to this roster.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}