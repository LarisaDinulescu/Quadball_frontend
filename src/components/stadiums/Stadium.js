import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import stadiumService from "../../services/stadiumService"; // Usiamo il service!
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { ArrowLeft, MapPin, Calendar, Plus, Trash2, Trophy, Users } from "lucide-react";
import CreateStadium from "./CreateStadium"; // Importa il tuo nuovo form

export default function StadiumPage() {
  const [stadiums, setStadiums] = useState([]);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Controllo Ruolo Manager
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isManager = user?.role === 'ROLE_ORGANIZATION_MANAGER';

  useEffect(() => {
    loadStadiums();
  }, []);

  const loadStadiums = async () => {
    try {
      setLoading(true);
      const data = await stadiumService.getAllStadiums();
      setStadiums(data);
    } catch (err) {
      console.error("Error loading stadiums", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStadiumDetails = async (id) => {
    try {
      const data = await stadiumService.getStadiumDetails(id);
      setSelectedStadium(data);
    } catch (err) {
      console.error("Error loading details", err);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Delete this stadium permanently?")) {
      try {
        await stadiumService.deleteStadium(id);
        loadStadiums();
      } catch (err) {
        alert("Action failed: check permissions.");
      }
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50 font-bold text-blue-600">
      Loading Arena Roster...
    </div>
  );

  // =====================
  // LISTA STADI (PUBBLICA)
  // =====================
  if (!selectedStadium) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
                Stadiums
              </h1>
              <p className="text-slate-500">Official league venues and arenas</p>
            </div>

            {/* Tasto Add Stadium: Solo per Manager */}
            {isManager && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg font-bold">
                    <Plus className="mr-2" size={20} /> New Stadium
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-none shadow-2xl opacity-100 sm:max-w-[450px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Register Stadium</DialogTitle>
                  </DialogHeader>
                  <CreateStadium onSuccess={() => {
                    setIsDialogOpen(false);
                    loadStadiums();
                  }} />
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stadiums.map((stadium) => (
              <Card 
                key={stadium.id} 
                className="bg-white border-none shadow-md hover:shadow-xl transition-all cursor-pointer group overflow-hidden"
                onClick={() => loadStadiumDetails(stadium.id)}
              >
                <CardContent className="p-0">
                  <div className="h-2 bg-blue-600 w-full" />
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-bold uppercase tracking-tight text-slate-800">{stadium.name}</h2>
                      {isManager && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-slate-300 hover:text-red-600 transition-colors"
                          onClick={(e) => handleDelete(e, stadium.id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin size={18} className="text-blue-600" />
                      <span className="font-medium">{stadium.address}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =====================
  // DETTAGLIO STADIO (PUBBLICO)
  // =====================
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => setSelectedStadium(null)} className="mb-8 hover:bg-white gap-2 text-slate-500">
          <ArrowLeft size={20} /> All Stadiums
        </Button>

        <div className="mb-10">
          <h1 className="text-5xl font-black uppercase italic text-slate-900 tracking-tighter">
            {selectedStadium.name}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border-none shadow-sm p-6 space-y-4">
            <div className="p-2 bg-blue-50 w-fit rounded-lg text-blue-600">
              <MapPin size={24} />
            </div>
            <h2 className="font-bold text-xl">Address</h2>
            <p className="text-slate-600 font-medium">{selectedStadium.address}</p>
          </Card>

          <Card className="bg-white border-none shadow-sm p-6 space-y-4">
            <div className="p-2 bg-blue-50 w-fit rounded-lg text-blue-600">
              <Users size={24} />
            </div>
            <h2 className="font-bold text-xl">Capacity</h2>
            <p className="text-slate-600 font-medium">
              {selectedStadium.capacity ? `${selectedStadium.capacity.toLocaleString()} seats` : "Not defined"}
            </p>
          </Card>

          <Card className="bg-white border-none shadow-sm p-6 space-y-4">
            <div className="p-2 bg-blue-50 w-fit rounded-lg text-blue-600">
              <Calendar size={24} />
            </div>
            <h2 className="font-bold text-xl">Next Event</h2>
            <p className="text-slate-600 font-medium">
              {selectedStadium.nextMatch || "No scheduled matches"}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}