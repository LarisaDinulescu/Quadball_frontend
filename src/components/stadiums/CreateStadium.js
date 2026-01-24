import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { MapPin, Trophy, Users, Save, Loader2 } from "lucide-react";
import stadiumService from '../../services/stadiumService';

export default function StadiumForm({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Mappatura esatta per StadiumEntity (capacity come Integer)
      const payload = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : 0
      };
      await stadiumService.createStadium(payload);
      onSuccess();
    } catch (error) {
      alert("Error creating stadium. Check if the name is unique.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-2">
      <div className="space-y-2">
        <Label>Stadium Name</Label>
        <div className="relative">
          <Input 
            required 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="pl-10" 
            placeholder="Olympic Stadium"
          />
          <Trophy className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Address</Label>
        <div className="relative">
          <Input 
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
            className="pl-10" 
            placeholder="Via dei Fori Imperiali, Rome"
          />
          <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Capacity</Label>
        <div className="relative">
          <Input 
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({...formData, capacity: e.target.value})}
            className="pl-10" 
            placeholder="e.g. 50000"
          />
          <Users className="absolute left-3 top-2.5 text-slate-400" size={18} />
        </div>
      </div>

      <Button type="submit" className="w-full bg-blue-600 font-bold py-6" disabled={loading}>
        {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
        Save Stadium
      </Button>
    </form>
  );
}