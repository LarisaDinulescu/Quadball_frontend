import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Save, Loader2, Trophy, Calendar, Home, Sword, MapPin } from "lucide-react";
import matchService from '../../services/matchService';

export default function MatchForm({ initialData, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    tournamentId: '',
    homeTeamId: '',
    awayTeamId: '',
    stadiumId: '',
    date: '',
    homeScore: 0,
    awayScore: 0
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        tournamentId: initialData.tournamentId || '',
        homeTeamId: initialData.homeTeamId || '',
        awayTeamId: initialData.awayTeamId || '',
        stadiumId: initialData.stadiumId || '',
        date: initialData.date || '',
        homeScore: initialData.homeScore || 0,
        awayScore: initialData.awayScore || 0
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      if (initialData?.id) {
        await matchService.updateMatch(initialData.id, formData);
      } else {
        await matchService.createMatch(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Action restricted to Organization Managers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-2 bg-white">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded text-xs border border-red-200 font-bold uppercase">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-bold uppercase text-[10px] text-slate-600">Tournament ID</Label>
          <div className="relative">
            <Input required value={formData.tournamentId} onChange={(e) => setFormData({...formData, tournamentId: e.target.value})} className="pl-10" />
            <Trophy className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="font-bold uppercase text-[10px] text-slate-600">Stadium ID</Label>
          <div className="relative">
            <Input required value={formData.stadiumId} onChange={(e) => setFormData({...formData, stadiumId: e.target.value})} className="pl-10" />
            <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-bold uppercase text-[10px] text-slate-600">Home Team ID</Label>
          <div className="relative">
            <Input value={formData.homeTeamId} onChange={(e) => setFormData({...formData, homeTeamId: e.target.value})} className="pl-10" />
            <Home className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="font-bold uppercase text-[10px] text-slate-600">Away Team ID</Label>
          <div className="relative">
            <Input value={formData.awayTeamId} onChange={(e) => setFormData({...formData, awayTeamId: e.target.value})} className="pl-10" />
            <Sword className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-bold uppercase text-[10px] text-slate-600">Match Date</Label>
        <div className="relative">
          <Input type="date" required value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="pl-10" />
          <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
      </div>

      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 uppercase tracking-widest shadow-lg mt-4" disabled={loading}>
        {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
        {initialData ? "Update Match Details" : "Schedule Match"}
      </Button>
    </form>
  );
}