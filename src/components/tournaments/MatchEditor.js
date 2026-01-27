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

    // Stato per i dati "visivi" (es. nomi squadre) che non modifichiamo
    const [matchDisplay, setMatchDisplay] = useState(location.state?.match || null);

    const [stadiums, setStadiums] = useState([]);
    const [loading, setLoading] = useState(true); // Partiamo con loading TRUE

    const [formData, setFormData] = useState({
        homeScore: 0,
        awayScore: 0,
        stadiumId: "",
        date: "",
        snitchCaughtByTeamId: null
    });

    useEffect(() => {
        const initData = async () => {
            try {
                // 1. Carichiamo gli stadi in parallelo
                const stadiumsPromise = stadiumService.getAllStadiums();

                let currentMatch = location.state?.match;

                // 2. Se NON abbiamo i dati dal "location.state" (es. dopo refresh), li chiediamo al backend
                if (!currentMatch) {
                    console.log("Dati persi al refresh, recupero dal server...");
                    currentMatch = await tournamentService.getMatchById(matchId);
                }

                // 3. Attendiamo gli stadi
                const stadiumsData = await stadiumsPromise;
                setStadiums(stadiumsData);

                // 4. Aggiorniamo lo stato
                if (currentMatch) {
                    setMatchDisplay(currentMatch); // Serve per mostrare "Gryffindor vs Slytherin" nell'header
                    setFormData({
                        homeScore: currentMatch.homeScore || 0,
                        awayScore: currentMatch.awayScore || 0,
                        stadiumId: currentMatch.stadiumId ? currentMatch.stadiumId.toString() : "",
                        date: currentMatch.date || "",
                        snitchCaughtByTeamId: currentMatch.snitchCaughtByTeamId ? currentMatch.snitchCaughtByTeamId.toString() : null
                    });
                }
            } catch (error) {
                console.error("Errore caricamento:", error);
            } finally {
                setLoading(false);
            }
        };

        initData();
    }, [matchId, location.state]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await tournamentService.updateMatch(matchId, formData);
            navigate('/tournaments');
        } catch (error) {
            alert("Error updating match details.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading match data...</div>;

    // Se dopo il caricamento non abbiamo ancora il match, allora è un errore vero (ID sbagliato)
    if (!matchDisplay) return <div className="p-10 text-center">Match ID not found.</div>;

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
            <span className="text-xl font-bold uppercase italic">{matchDisplay.homeTeam}</span>
            <span className="text-blue-600 font-black italic text-2xl px-4">VS</span>
            <span className="text-xl font-bold uppercase italic">{matchDisplay.awayTeam}</span>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-8 space-y-8">
            
            {/* SCORE SECTION */}
            <div className="grid grid-cols-2 gap-8 py-6 bg-blue-50/50 rounded-xl px-4 border border-blue-100">
              <div className="space-y-2 text-center">
                <Label className="font-bold text-xs uppercase text-slate-500">{matchDisplay.homeTeam} Score</Label>
                <Input 
                  type="number" 
                  className="text-center text-3xl font-black h-16 border-2 focus:ring-blue-600"
                  value={formData.homeScore}
                  onChange={(e) => setFormData({...formData, homeScore: e.target.value})}
                />
              </div>
              <div className="space-y-2 text-center">
                <Label className="font-bold text-xs uppercase text-slate-500">{matchDisplay.awayTeam} Score</Label>
                <Input 
                  type="number" 
                  className="text-center text-3xl font-black h-16 border-2 focus:ring-blue-600"
                  value={formData.awayScore}
                  onChange={(e) => setFormData({...formData, awayScore: e.target.value})}
                />
              </div>
            </div>

              {/* MODIFICA 4: AGGIUNTA SEZIONE BOCCINO (SNITCH) */}
              <div className="space-y-2 border p-4 rounded-lg bg-yellow-50/50 border-yellow-200">
                  <Label className="font-bold text-xs uppercase text-yellow-700">Golden Snitch Caught By</Label>
                  <Select
                      // Gestiamo il valore null convertendolo in stringa per il select
                      value={formData.snitchCaughtByTeamId ? formData.snitchCaughtByTeamId.toString() : "none"}
                      onValueChange={(val) => setFormData({...formData, snitchCaughtByTeamId: val === "none" ? null : val})}
                  >
                      <SelectTrigger className="bg-white border-yellow-300">
                          <SelectValue placeholder="No one / Still flying" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-50">
                          <SelectItem value="none">No one / Still flying</SelectItem>
                          <SelectItem value={matchDisplay.homeTeamId.toString()}>Home Team ({matchDisplay.homeTeamId})</SelectItem>
                          <SelectItem value={matchDisplay.awayTeamId.toString()}>Away Team ({matchDisplay.awayTeamId})</SelectItem>
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