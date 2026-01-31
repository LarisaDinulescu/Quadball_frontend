import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Save, Loader2, Trophy, MapPin, Users } from "lucide-react";
import stadiumService from '../../services/stadiumService';

export default function StadiumForm({ initialData, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: '', address: '', capacity: '' });

  // Sync form with initialData for editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        capacity: initialData.capacity || ''
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const payload = { 
        ...formData, 
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : 0 
      };

      if (initialData?.id) {
        // Mode: Edit
        await stadiumService.updateStadium(initialData.id, payload);
      } else {
        // Mode: Create
        await stadiumService.createStadium(payload);
      }
      onSuccess();
    } catch (err) {
      // Handles the "Forbidden" or "Unique Name" errors from images
      setError(err.response?.data?.message || "Action restricted to Organization Managers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-2 bg-white">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded text-xs border border-red-200 font-bold uppercase">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label className="font-bold uppercase text-[10px] text-slate-600">Stadium Name</Label>
        <div className="relative">
          <Input 
            required 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            className="pl-10 border-slate-200 focus:ring-indigo-500"
          />
          <Trophy className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-bold uppercase text-[10px] text-slate-600">Address</Label>
        <div className="relative">
          <Input 
            required 
            value={formData.address} 
            onChange={(e) => setFormData({...formData, address: e.target.value})} 
            className="pl-10 border-slate-200 focus:ring-indigo-500"
          />
          <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="font-bold uppercase text-[10px] text-slate-600">Capacity</Label>
        <div className="relative">
          <Input 
            type="number" 
            value={formData.capacity} 
            onChange={(e) => setFormData({...formData, capacity: e.target.value})} 
            className="pl-10 border-slate-200 focus:ring-indigo-500"
          />
          <Users className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-6 uppercase tracking-widest shadow-lg transition-all" 
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
        {initialData ? "Update Arena Info" : "Confirm Registration"}
      </Button>
    </form>
  );
}