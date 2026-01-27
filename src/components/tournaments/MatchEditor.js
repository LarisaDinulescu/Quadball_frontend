import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Save, ChevronLeft, MapPin, Calendar, Loader2, Trophy } from "lucide-react";
import stadiumService from '../../services/stadiumService';
import tournamentService from '../../services/tournamentService';

export default function MatchEditor() {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 'match' expected to contain: homeTeamId, awayTeamId, homeTeamName, awayTeamName, etc.
  const { match } = location.state || {};

  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    homeScore: match?.homeScore || 0,
    awayScore: match?.awayScore || 0,
    stadiumId: match?.stadiumId || "",
    date: match?.date || "",
    snitchCaughtByTeamId: match?.snitchCaughtByTeamId || ""
  });

  useEffect(() => {
    // Fetch stadiums to allow the manager to assign a venue
    stadiumService.getAllStadiums()
      .then(setStadiums)
      .catch(err => console.error("Failed to load stadiums", err));
  }, []);

  if (!match) return <div className="p-10 text-center font-bold text-slate-500">Match data not found.</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Formatting data for backend
    const payload = {
      ...formData,
      homeScore: parseInt(formData.homeScore),
      awayScore: parseInt(formData.awayScore),
      stadiumId: formData.stadiumId ? parseInt(formData.stadiumId) : null,
      snitchCaughtByTeamId: formData.snitchCaughtByTeamId ? parseInt(formData.snitchCaughtByTeamId) : null
    };

    try {
      await tournamentService.updateMatch(matchId, payload);
      navigate('/tournaments');
    } catch (error) {
      console.error(error);
      alert("Error updating match details. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-10 px-4 mb-20">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/tournaments')} 
        className="mb-6 flex items-center gap-2 text-slate-600 hover:text-blue-600"
      >
        <ChevronLeft size={20} /> Back to Bracket
      </Button>

      <Card className="shadow-2xl border-t-4 border-t-blue-600 bg-white overflow-hidden">
        <CardHeader className="text-center border-b bg-slate-50/50">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Match Management</CardTitle>
          <div className="flex justify-between items-center mt-4 px-4">
            <span className="text-xl font-bold uppercase italic text-slate-700">{match.homeTeamName || 'Home Team'}</span>
            <div className="flex flex-col items-center">
                <span className="text-blue-600 font-black italic text-2xl px-4">VS</span>
            </div>
            <span className="text-xl font-bold uppercase italic text-slate-700">{match.awayTeamName || 'Away Team'}</span>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 space-y-8">
            
            {/* SCORE SECTION */}
            <div className="grid grid-cols-2 gap-8 py-6 bg-blue-50/50 rounded-xl px-4 border border-blue-100">
              <div className="space-y-2 text-center">
                <Label className="font-bold text-xs uppercase text-slate-500">Home Score</Label>
                <Input 
                  type="number" 
                  className="text-center text-3xl font-black h-16 border-2 focus:ring-blue-600 bg-white"
                  value={formData.homeScore}
                  onChange={(e) => setFormData({...formData, homeScore: e.target.value})}
                />
              </div>
              <div className="space-y-2 text-center">
                <Label className="font-bold text-xs uppercase text-slate-500">Away Score</Label>
                <Input 
                  type="number" 
                  className="text-center text-3xl font-black h-16 border-2 focus:ring-blue-600 bg-white"
                  value={formData.awayScore}
                  onChange={(e) => setFormData({...formData, awayScore: e.target.value})}
                />
              </div>
            </div>

            {/* QUADBALL SPECIFIC: SNITCH CAPTURE */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-bold text-xs uppercase text-slate-500">
                <Trophy size={14} className="text-yellow-500" /> Snitch Caught By
              </Label>
              <Select 
                onValueChange={(val) => setFormData({...formData, snitchCaughtByTeamId: val})}
                value={formData.snitchCaughtByTeamId?.toString()}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select which team caught the snitch" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="none">No capture yet</SelectItem>
                  <SelectItem value={match.homeTeamId?.toString()}>{match.homeTeamName}</SelectItem>
                  <SelectItem value={match.awayTeamId?.toString()}>{match.awayTeamName}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* LOGISTICS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-bold text-xs uppercase text-slate-500">
                  <MapPin size={14} /> Stadium / Venue
                </Label>
                <Select 
                  onValueChange={(val) => setFormData({...formData, stadiumId: val})}
                  value={formData.stadiumId?.toString()}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Stadium" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {stadiums.map(s => (
                      <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-bold text-xs uppercase text-slate-500">
                  <Calendar size={14} /> Match Date
                </Label>
                <Input 
                  type="date" 
                  className="bg-white"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>

          </CardContent>

          <CardFooter className="bg-slate-900 p-6">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 py-6 text-lg font-bold text-white transition-colors"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
              UPDATE MATCH RESULTS
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}