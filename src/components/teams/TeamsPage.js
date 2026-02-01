import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import teamService from "../../services/teamService";
import { hasRole } from "../../services/authService"; 
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Plus, Users, Shield, MapPin, Trash2, Edit3 } from "lucide-react";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Define roles for permissions
  const isORGManager = hasRole('ROLE_ORGANIZATION_MANAGER');
  const isTEAMManager = hasRole('ROLE_TEAM_MANAGER');
  const canModify = isORGManager || isTEAMManager;

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamService.getAllTeams();
      setTeams(data);
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        navigate("/login");
      } else {
        console.error("Error loading teams:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this team? This action is irreversible.")) {
      try {
        await teamService.deleteTeam(id);
        loadTeams(); 
      } catch (err) {
        alert("Error during deletion. You might not have the necessary permissions.");
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse font-black text-slate-400 uppercase tracking-widest">Loading League...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter text-slate-900">
              League <span className="text-indigo-600">Teams</span>
            </h1>
            <p className="text-slate-500 font-medium">Official management of active organizations</p>
          </div>

          {isORGManager && (
            <Button 
              onClick={() => navigate("/teams/create")}
              className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg font-bold px-6 text-white"
            >
              <Plus size={22} /> Add Team
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map((team) => (
            <Card key={team.id} className="group hover:shadow-2xl transition-all border-none shadow-lg bg-white overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 bg-white border-b border-slate-50 p-6">
                <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <Shield size={32} />
                </div>
                <div>
                  <CardTitle className="uppercase font-black text-xl text-slate-800">{team.name}</CardTitle>
                  <div className="flex items-center text-slate-400 text-sm font-bold">
                    <MapPin size={14} className="mr-1" /> {team.city}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-slate-600 mb-8 bg-slate-50 p-3 rounded-lg">
                  <Users size={18} className="text-indigo-500" />
                  <span className="text-sm font-black uppercase tracking-wider">
                    {team.players?.length || 0} Registered Members
                  </span>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white font-black uppercase text-xs tracking-widest h-12 transition-all"
                    onClick={() => navigate(`/teams/${team.id}`)}
                  >
                    View Roster
                  </Button>
                  
                  {canModify && (
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600"
                        onClick={() => navigate(`/teams/edit/${team.id}`)}
                      >
                        <Edit3 size={20} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-12 w-12 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                        onClick={() => handleDelete(team.id)}
                      >
                        <Trash2 size={20} />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}