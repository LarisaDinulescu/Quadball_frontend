import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { 
  Search, 
  Trash2, 
  Edit, 
  User, 
  Ticket, 
  ChevronLeft, 
  Loader2, 
  Mail,
  MoreHorizontal
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import reservationService from '../../services/reservationService';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const data = await reservationService.getAllReservations();
      setReservations(data);
    } catch (error) {
      console.error("Failed to load reservations", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to cancel this reservation? This action cannot be undone.")) {
      try {
        await reservationService.deleteReservation(id);
        setReservations(reservations.filter(r => r.id !== id));
      } catch (error) {
        alert("Error deleting reservation.");
      }
    }
  };

  // Filter reservations by email or ID code
  const filteredReservations = reservations.filter(res => 
    res.spectatorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.id?.toString().includes(searchTerm)
  );

  if (loading) return <div className="flex h-screen items-center justify-center font-bold text-blue-600">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/profile')} 
              className="mb-4 p-0 hover:bg-transparent text-slate-500 hover:text-blue-600 flex items-center gap-2"
            >
              <ChevronLeft size={20} /> Back to Profile
            </Button>
            <h1 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">
              Reservations <span className="text-blue-600">Master List</span>
            </h1>
            <p className="text-slate-500 mt-1">Manage and monitor all spectator bookings in the system.</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by email or code..."
              className="pl-10 pr-4 py-3 bg-white border-none shadow-sm rounded-xl w-full md:w-[300px] focus:ring-2 focus:ring-blue-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Reservations Table */}
        <Card className="border-none shadow-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="p-5 uppercase text-xs font-black tracking-widest">Code</th>
                  <th className="p-5 uppercase text-xs font-black tracking-widest">Spectator</th>
                  <th className="p-5 uppercase text-xs font-black tracking-widest">Match Details</th>
                  <th className="p-5 uppercase text-xs font-black tracking-widest text-center">Seats</th>
                  <th className="p-5 uppercase text-xs font-black tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReservations.length > 0 ? (
                  filteredReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-5">
                        <span className="font-mono font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-md text-sm">
                          #{res.id}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="bg-slate-100 p-2 rounded-full text-slate-400">
                            <User size={16} />
                          </div>
                          <span className="text-sm font-semibold text-slate-700">{res.spectatorEmail}</span>
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 text-sm">{res.matchName || "Tournament Match"}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Ticket size={12} /> Stadium ID: {res.stadiumId}
                          </p>
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-full text-xs">
                          {res.seatCount} SEATS
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => alert("Edit feature coming soon (integrating with reservation form)")}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => handleDelete(res.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-20 text-center text-slate-400 italic">
                      No reservations found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
          <Card className="bg-blue-600 border-none p-6">
            <p className="text-blue-100 uppercase text-[10px] font-black tracking-widest">Total Reservations</p>
            <p className="text-3xl font-black italic">{reservations.length}</p>
          </Card>
          <Card className="bg-slate-900 border-none p-6">
            <p className="text-slate-400 uppercase text-[10px] font-black tracking-widest">Total Seats Booked</p>
            <p className="text-3xl font-black italic">
              {reservations.reduce((acc, curr) => acc + (curr.seatCount || 0), 0)}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminReservations;