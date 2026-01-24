import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Ticket, MapPin, Calendar, Users } from "lucide-react";
import reservationService from '../../services/reservationService';

export default function MatchReservation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { match } = location.state || {}; // We receive data from the tournament click

  const [seatCount, setSeatCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reservationId, setReservationId] = useState(null);

  if (!match) return <div className="p-10 text-center font-bold">Match data not found.</div>;

  const handleBooking = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const data = {
        matchId: match.id,
        spectatorEmail: user.email,
        seatCount: seatCount,
        stadiumId: match.stadiumId
      };
      
      const result = await reservationService.createReservation(data);
      setReservationId(result.id); // The ID returned by the backend
    } catch (error) {
      console.error("Booking error", error);
      alert("An error occurred during the booking process.");
    } finally {
      setLoading(false);
    }
  };

  if (reservationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <Card className="max-w-md w-full border-2 border-green-500 shadow-2xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Ticket size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Booking Confirmed!</h2>
            <p className="text-slate-600">Show this code at the stadium ticket office:</p>
            <div className="bg-slate-100 p-4 rounded-lg font-mono text-3xl font-black tracking-widest text-blue-600">
              {reservationId}
            </div>
            <Button onClick={() => navigate('/tournaments')} className="w-full bg-slate-900 hover:bg-slate-800">
              Back to Tournaments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Book Seats</h1>
        
        <Card className="overflow-hidden border-none shadow-lg bg-white">
          <div className="h-2 bg-blue-600" />
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div className="text-center flex-1 font-bold text-xl uppercase tracking-tight">{match.teamA}</div>
              <div className="px-4 text-blue-600 font-black italic text-2xl">VS</div>
              <div className="text-center flex-1 font-bold text-xl uppercase tracking-tight">{match.teamB}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-blue-500" />
                <span className="font-semibold">{match.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-blue-500" />
                <span className="font-semibold">{match.stadiumName || "Stadium TBD"}</span>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                How many seats would you like to reserve?
              </label>
              <div className="flex items-center gap-4">
                <Input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={seatCount} 
                  onChange={(e) => setSeatCount(e.target.value)}
                  className="w-24 text-lg font-bold border-slate-200 focus:ring-blue-600"
                />
                <span className="text-slate-400 text-sm">Max 10 seats per person</span>
              </div>
            </div>

            <Button 
              onClick={handleBooking} 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold transition-all transform hover:scale-[1.01]"
            >
              {loading ? "Processing..." : "Confirm Reservation"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}