import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import teamService from "../../services/teamService";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Plus, Users, Shield, MapPin } from "lucide-react";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Controllo Ruolo
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isManager = user?.role === "ROLE_ORGANIZATION_MANAGER";

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const data = await teamService.getAllTeams();
        setTeams(data);
      } catch (err) {
        console.error("Error loading teams", err);
      } finally {
        setLoading(false);
      }
    };
    loadTeams();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold">Loading Roster...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              League <span className="text-blue-600">Teams</span>
            </h1>
            <p className="text-slate-500">Discover all active quadball organizations</p>
          </div>

          {isManager && (
            <Button 
              onClick={() => navigate("/teams/create")}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg gap-2"
            >
              <Plus size={20} /> New Team
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="hover:shadow-xl transition-all border-none shadow-md">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <Shield size={32} />
                </div>
                <div>
                  <CardTitle className="uppercase font-bold text-xl">{team.name}</CardTitle>
                  <div className="flex items-center text-slate-400 text-sm">
                    <MapPin size={14} className="mr-1" /> {team.city}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-slate-600 mb-4">
                  <Users size={16} />
                  <span className="text-sm font-medium">{team.players?.length || 0} Members</span>
                </div>
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-bold">
                  View Full Roster
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}