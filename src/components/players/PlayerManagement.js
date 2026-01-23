import React, { useState, useEffect } from 'react';
import { Plus, Users, Loader2, Trash2, Edit } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import playerService from "../../services/playerService";
import PlayerForm from "./PlayerForm"; 

const PlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

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

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedPlayer(null);
    fetchPlayers();
  };

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
    <div className="space-y-6 bg-slate-50 min-h-screen p-6">
      {/* Header con titolo unico e pulsante */}
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
          Players
        </h2>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedPlayer(null);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg font-bold px-6">
              <Plus size={20} /> Add New Player
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[500px] bg-white border-none shadow-2xl opacity-100">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {selectedPlayer ? "Edit Player" : "Create New Player"}
              </DialogTitle>
            </DialogHeader>
            <PlayerForm 
              initialData={selectedPlayer} 
              onSuccess={handleSuccess} 
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Card con tabella - Sfondo bianco solido senza trasparenze */}
      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                Loading Roster...
              </p>
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-24">
              <Users size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 text-lg font-medium">No players registered yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 border-b">
                <TableRow>
                  <TableHead className="font-bold text-slate-700 uppercase text-xs tracking-wider h-12">Full Name</TableHead>
                  <TableHead className="font-bold text-slate-700 uppercase text-xs tracking-wider h-12">Position</TableHead>
                  <TableHead className="font-bold text-slate-700 uppercase text-xs tracking-wider h-12 text-center">Jersey #</TableHead>
                  <TableHead className="font-bold text-slate-700 uppercase text-xs tracking-wider h-12 text-right pr-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id} className="hover:bg-blue-50/50 transition-colors group border-b last:border-0">
                    <TableCell className="py-4 font-bold text-slate-900">
                      {player.firstName} {player.lastName}
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-200">
                        {player.position}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-center font-mono font-black text-slate-500">
                      {player.jerseyNumber ? `#${player.jerseyNumber}` : "--"}
                    </TableCell>
                    <TableCell className="py-4 text-right pr-8">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          onClick={() => {
                            setSelectedPlayer(player);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit size={18} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          onClick={() => handleDelete(player.id)}
                        >
                          <Trash2 size={18} />
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