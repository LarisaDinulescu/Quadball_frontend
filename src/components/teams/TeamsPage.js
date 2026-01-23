import React, { useEffect, useState } from "react";
import teamService from "../../services/teamService";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Users, Plus, Trash2, Shield } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import TeamForm from "./TeamForm";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Controllo permessi
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isManager = user?.role === 'ROLE_ORGANIZATION_MANAGER';

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await teamService.getAllTeams();
      setTeams(data);
    } catch (error) {
      console.error("Error loading teams:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false); // Chiude il modal
    loadTeams(); // Ricarica la lista aggiornata
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        await teamService.deleteTeam(id);
        loadTeams();
      } catch (error) {
        alert("Failed to delete team.");
      }
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-blue-600">Loading Teams...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
            Global <span className="text-blue-600">Teams</span>
          </h1>
          
          {/* Mostra il Dialog solo se l'utente è Organization Manager */}
          {isManager && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg gap-2">
                  <Plus size={18} /> Add New Team
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Create New Team</DialogTitle>
                </DialogHeader>
                <TeamForm onSuccess={handleSuccess} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teams.length === 0 ? (
            <div className="col-span-full text-center py-20 text-slate-400 font-medium">
              No teams found. {isManager && "Start by adding one!"}
            </div>
          ) : (
            teams.map((team) => (
              <Card key={team.id} className="relative group overflow-hidden border-none shadow-md hover:shadow-xl transition-all bg-white">
                <div className="h-2 bg-blue-600" /> 
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto bg-slate-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-2">
                    <Shield size={40} className="text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-bold uppercase truncate px-2">
                    {team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <p className="text-slate-500 text-sm font-medium mb-4">
                    {team.city || "Professional Team"} {team.foundationYear ? `(Est. ${team.foundationYear})` : ""}
                  </p>
                  
                  {isManager && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(team.id)}
                    >
                      <Trash2 size={18} />
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 font-bold">
                    View Roster
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}