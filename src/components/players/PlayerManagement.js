import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";

const PlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    role: '',
    jerseyNumber: ''
  });

  // Helper to get the token from localStorage
  const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  };

  // 1. Fetch Players from Backend
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/players', {
        headers: getAuthHeader() // Attaching the token here
      });
      setPlayers(response.data);
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // 2. Save New Player to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/players', formData, {
        headers: getAuthHeader() // Attaching the token here
      });
      
      setFormData({ name: '', surname: '', role: '', jerseyNumber: '' });
      setIsDialogOpen(false);
      fetchPlayers();
    } catch (error) {
      console.error("Error saving player:", error);
      alert("Failed to save player. Make sure the backend is running and you are authorized.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Players List</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
              <Plus size={18} /> Add New Player
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Dummy Player</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="First Name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                />
                <Input 
                  placeholder="Last Name" 
                  value={formData.surname}
                  onChange={(e) => setFormData({...formData, surname: e.target.value})}
                  required 
                />
              </div>
              <Input 
                placeholder="Role (e.g. Chaser, Beater)" 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required 
              />
              <Input 
                type="number" 
                placeholder="Jersey Number" 
                value={formData.jerseyNumber}
                onChange={(e) => setFormData({...formData, jerseyNumber: e.target.value})}
                required 
              />
              <Button type="submit" className="w-full bg-blue-600">Save Player</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users size={20} className="text-blue-600" /> Registered Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-blue-600" />
            </div>
          ) : players.length === 0 ? (
            <p className="text-center text-slate-500 py-10">No players found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.name} {player.surname}</TableCell>
                    <TableCell>{player.role}</TableCell>
                    <TableCell>{player.jerseyNumber}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerManagement;