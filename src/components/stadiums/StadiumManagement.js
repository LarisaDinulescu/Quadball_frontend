import React, { useEffect, useState } from "react";
import stadiumService from "../../services/stadiumService"; 
import { hasRole } from "../../services/authService";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ArrowLeft, MapPin, Plus, Trash2, Loader2, Trophy, Edit } from "lucide-react";
import StadiumForm from "./StadiumForm"; 

export default function StadiumManagement() {
  const [stadiums, setStadiums] = useState([]);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [editingStadium, setEditingStadium] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // check role for permission
  const isManager = hasRole('ROLE_ORGANIZATION_MANAGER');

  const loadStadiums = async () => {
    try {
      setLoading(true);
      const data = await stadiumService.getAllStadiums();
      setStadiums(data);
    } catch (err) {
      console.error("Error fetching stadiums", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStadiums(); }, []);

  const handleEdit = (e, stadium) => {
    e.stopPropagation(); 
    setEditingStadium(stadium);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingStadium(null);
    loadStadiums();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this stadium permanently?")) {
      try {
        await stadiumService.deleteStadium(id);
        loadStadiums();
      } catch (err) {
        alert("Action forbidden: Ensure you are logged in as a Manager.");
      }
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center font-bold text-indigo-600 uppercase tracking-widest bg-slate-50">
      <Loader2 className="animate-spin mr-2" /> Loading Arenas...
    </div>
  );

  if (!selectedStadium) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">Stadiums</h1>
              <p className="text-slate-500 font-medium">Official league venues</p>
            </div>

            {isManager && (
              <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if(!v) setEditingStadium(null); }}>
                <DialogTrigger asChild>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg font-bold px-6 text-white">
                    <Plus size={20} /> Add Stadium
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-none shadow-2xl sm:max-w-[450px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-indigo-900 uppercase italic">
                      {editingStadium ? "Edit Stadium" : "Register Stadium"}
                    </DialogTitle>
                  </DialogHeader>
                  <StadiumForm 
                    initialData={editingStadium} 
                    onSuccess={handleSuccess} 
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stadiums.map((stadium) => (
              <Card 
                key={stadium.id} 
                className="bg-white border-none shadow-md hover:shadow-xl transition-all cursor-pointer group border-t-4 border-indigo-600"
                onClick={() => setSelectedStadium(stadium)}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <Trophy size={24} className="text-indigo-600" />
                    {isManager && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => handleEdit(e, stadium)} className="text-slate-300 hover:text-indigo-600">
                          <Edit size={18}/>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, stadium.id)} className="text-slate-300 hover:text-red-600">
                          <Trash2 size={18}/>
                        </Button>
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-800">{stadium.name}</h2>
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin size={16} className="text-indigo-400" />
                    <span className="text-sm font-medium">{stadium.address}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => setSelectedStadium(null)} className="mb-8 font-bold text-slate-500 hover:bg-white uppercase text-xs">
          <ArrowLeft className="mr-2" size={16} /> Back to list
        </Button>
        <h1 className="text-6xl font-black uppercase italic text-slate-900 mb-10 tracking-tighter">
          {selectedStadium.name}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <Card className="p-8 border-none shadow-sm bg-white">
              <h3 className="font-bold text-indigo-600 uppercase text-[10px] mb-2 tracking-widest">Location</h3>
              <p className="text-2xl font-semibold text-slate-800">{selectedStadium.address}</p>
           </Card>
           <Card className="p-8 border-none shadow-sm bg-white">
              <h3 className="font-bold text-indigo-600 uppercase text-[10px] mb-2 tracking-widest">Capacity</h3>
              <p className="text-2xl font-semibold text-slate-800">
                {selectedStadium.capacity ? `${selectedStadium.capacity.toLocaleString()} SPECTATORS` : "TBD"}
              </p>
           </Card>
        </div>
      </div>
    </div>
  );
}