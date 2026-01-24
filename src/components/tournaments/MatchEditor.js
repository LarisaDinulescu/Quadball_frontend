import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Save, ChevronLeft, Trophy, MapPin, Calendar, Loader2 } from "lucide-react";
import stadiumService from '../../services/stadiumService';
import tournamentService from '../../services/tournamentService';

export default function MatchEditor() {
  const { matchId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { match } = location.state || {};

  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    scoreA: match?.scoreA || 0,
    scoreB: match?.scoreB || 0,
    stadiumId: match?.stadiumId || "",
    date: match?.date || ""
  });

  useEffect(() => {
    // Carichiamo gli stadi per permettere al manager di scegliere dove si gioca
    stadiumService.getAllStadiums().then(setStadiums).catch(console.error);
  }, []);

  if (!match) return <div className="p-10 text-center">Match data not found.</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Chiamata al backend per aggiornare il match
      await tournamentService.updateMatch(matchId, formData);
      navigate('/tournaments');
    } catch (error) {
      alert("Error updating match details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-10 px-4 mb-20">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/tournaments')} 
        className="mb-6 flex items-center gap-2 text-slate-600"
      >
        <ChevronLeft size={20} /> Back to Bracket
      </Button>

      <Card className="shadow-2xl border-t-4 border-t-blue-600 bg-white">
        <CardHeader className="text-center border-b bg-slate-50/50">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Match Management</CardTitle>
          <div className="flex justify-between items-center mt-4 px-4">
            <span className="text-xl font-bold uppercase italic">{match.teamA}</span>
            <span className="text-blue-600 font-black italic text-2xl px-4">VS</span>
            <span className="text-xl font-bold uppercase italic">{match.teamB}</span>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 space-y-8">
            
            {/* SCORE SECTION */}
            <div className="grid grid-cols-2 gap-8 py-6 bg-blue-50/50 rounded-xl px-4 border border-blue-100">
              <div className="space-y-2 text-center">
                <Label className="font-bold text-xs uppercase text-slate-500">{match.teamA} Score</Label>
                <Input 
                  type="number" 
                  className="text-center text-3xl font-black h-16 border-2 focus:ring-blue-600"
                  value={formData.scoreA}
                  onChange={(e) => setFormData({...formData, scoreA: e.target.value})}
                />
              </div>
              <div className="space-y-2 text-center">
                <Label className="font-bold text-xs uppercase text-slate-500">{match.teamB} Score</Label>
                <Input 
                  type="number" 
                  className="text-center text-3xl font-black h-16 border-2 focus:ring-blue-600"
                  value={formData.scoreB}
                  onChange={(e) => setFormData({...formData, scoreB: e.target.value})}
                />
              </div>
            </div>

            {/* LOGISTICS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-bold text-xs uppercase text-slate-500">
                  <MapPin size={14} /> Stadium / Venue
                </Label>
                <Select 
                  onValueChange={(val) => setFormData({...formData, stadiumId: val})}
                  defaultValue={formData.stadiumId.toString()}
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

          <CardFooter className="bg-slate-900 p-6 rounded-b-lg">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-500 py-6 text-lg font-bold"
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