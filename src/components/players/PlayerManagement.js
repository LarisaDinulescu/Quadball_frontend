import React, { useState, useEffect } from 'react';
import { Plus, Users, Loader2, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import playerService from "../../services/playerService";
import { PlayerForm } from "./PlayerForm"; 

const PlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // 1. Fetch Players using the updated service
  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const data = await playerService.getAllPlayers();
      setPlayers(data);
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // 2. Handle successful save/update
  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedPlayer(null);
    fetchPlayers();
  };

  // 3. Handle deletion
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this player?")) {
      try {
        await playerService.deletePlayer(id);
        fetchPlayers();
      } catch (error) {
        console.error("Error deleting player:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">
          Team <span className="text-blue-600">Roster</span>
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedPlayer(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg">
              <Plus size={18} /> Add New Player
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {selectedPlayer ? "Edit Player" : "Create New Player"}
              </DialogTitle>
            </DialogHeader>
            {/* Usiamo il componente PlayerForm che abbiamo aggiornato prima */}
            <PlayerForm 
              initialData={selectedPlayer} 
              onSuccess={handleSuccess} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-xl bg-white/50 backdrop-blur">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg flex items-center gap-2 uppercase font-bold tracking-wider text-slate-700">
            <Users size={20} className="text-blue-600" /> Current Players
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-400 font-medium animate-pulse">Updating roster...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">No players registered in the system.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold">Full Name</TableHead>
                  <TableHead className="font-bold">Position</TableHead>
                  <TableHead className="font-bold text-center">Jersey #</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id} className="hover:bg-blue-50/30 transition-colors group">
                    <TableCell className="font-semibold text-slate-900">
                      {player.firstName} {player.lastName}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
                        {player.position}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-slate-600">
                      #{player.jerseyNumber}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover:text-blue-600"
                          onClick={() => {
                            setSelectedPlayer(player);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Plus size={16} className="rotate-45" /> {/* Simbolo di edit veloce o usa icona Edit */}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(player.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
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