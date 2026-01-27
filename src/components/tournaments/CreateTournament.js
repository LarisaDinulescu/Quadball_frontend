import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Trophy, Calendar, MapPin, ChevronLeft, Users, Check } from "lucide-react";
import tournamentService from '../../services/tournamentService';
import teamService from '../../services/teamService';

const CreateTournament = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]); // All teams from DB
  const [selectedTeamIds, setSelectedTeamIds] = useState([]); // Selected teams
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
  });

  // Load teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await teamService.getAllTeams();
        setTeams(data);
      } catch (err) {
        console.error("Error fetching teams", err);
        setError("Could not load teams. Please check your connection.");
      }
    };
    fetchTeams();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleTeam = (teamId) => {
    setSelectedTeamIds(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId) 
        : [...prev, teamId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (selectedTeamIds.length < 2) {
      setError("Please select at least 2 teams to generate a bracket.");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError("Start date cannot be after end date.");
      return;
    }

    setError('');
    setLoading(true);

    // Payload aligned with backend requirements
    const payload = {
      name: formData.name,
      location: formData.location,
      startDate: formData.startDate,
      endDate: formData.endDate,
      teamIds: selectedTeamIds 
    };

    try {
      await tournamentService.createTournament(payload);
      navigate('/tournaments');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create tournament.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pt-10 px-4 mb-20">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/tournaments')} 
        className="mb-6 flex items-center gap-2 text-slate-600"
      >
        <ChevronLeft size={20} /> Back to List
      </Button>

      <Card className="shadow-xl border-t-4 border-t-blue-600 bg-white">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Trophy size={24} />
            </div>
            <CardTitle className="text-2xl font-bold italic uppercase tracking-tighter">Initialize Tournament</CardTitle>
          </div>
          <CardDescription>
            Enter tournament details and select the competing teams to generate the bracket.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold uppercase text-xs text-slate-500">Tournament Name</Label>
                <div className="relative">
                  <Input 
                    id="name" name="name" required
                    value={formData.name} onChange={handleChange}
                    className="pl-10" placeholder="e.g. European Quadball Cup"
                  />
                  <Trophy className="absolute left-3 top-2.5 text-slate-400" size={18} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="font-bold uppercase text-xs text-slate-500">Start Date</Label>
                  <div className="relative">
                    <Input 
                      id="startDate" name="startDate" type="date" required
                      value={formData.startDate} onChange={handleChange}
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate" className="font-bold uppercase text-xs text-slate-500">End Date</Label>
                  <div className="relative">
                    <Input 
                      id="endDate" name="endDate" type="date" required
                      value={formData.endDate} onChange={handleChange}
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="font-bold uppercase text-xs text-slate-500">General Location</Label>
                <div className="relative">
                  <Input 
                    id="location" name="location" required
                    value={formData.location} onChange={handleChange}
                    className="pl-10" placeholder="City or Main Hub"
                  />
                  <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
                </div>
              </div>
            </div>

            {/* Team Selection Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-end">
                <Label className="font-bold uppercase text-xs text-slate-500 flex items-center gap-2">
                  <Users size={16} /> Select Competing Teams ({selectedTeamIds.length})
                </Label>
                <span className="text-[10px] text-slate-400 italic font-medium">Minimum 2 teams required</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 border rounded-lg bg-slate-50/50">
                {teams.length > 0 ? (
                  teams.map((team) => (
                    <div 
                      key={team.id}
                      onClick={() => toggleTeam(team.id)}
                      className={`
                        flex items-center justify-between p-3 rounded-md border-2 cursor-pointer transition-all
                        ${selectedTeamIds.includes(team.id) 
                          ? "border-blue-600 bg-blue-50" 
                          : "border-transparent bg-white hover:border-slate-200 shadow-sm"}
                      `}
                    >
                      <span className={`text-sm font-bold ${selectedTeamIds.includes(team.id) ? "text-blue-700" : "text-slate-700"}`}>
                        {team.name}
                      </span>
                      {selectedTeamIds.includes(team.id) && (
                        <div className="bg-blue-600 rounded-full p-0.5 text-white">
                          <Check size={14} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="col-span-2 text-center py-4 text-slate-400 text-sm">No teams found. Please create teams first!</p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50/50 border-t p-6 mt-6">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold transition-all shadow-lg"
              disabled={loading}
            >
              {loading ? "Processing..." : "Generate Tournament Bracket"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateTournament;