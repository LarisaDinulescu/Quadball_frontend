import React, { useEffect, useState } from "react";
import matchService from "../../services/matchService"; 
import teamService from "../../services/teamService"; 
import reservationService from "../../services/reservationService"; 
import { hasRole } from "../../services/authService";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../ui/dialog";
import { Play, Trash2, Loader2, Calendar, Edit, Ticket } from "lucide-react"; 
import MatchForm from "./MatchForm"; 
import { useNavigate } from "react-router-dom";

export default function MatchManagement() {
  const navigate = useNavigate(); // Bunu ekle
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState({}); 
  const [loading, setLoading] = useState(true);
  
  // Match Management states (Manager)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);

  // Reservation states (User)
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reservationId, setReservationId] = useState(null);

  const isManager = hasRole('ROLE_ORGANIZATION_MANAGER');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [matchData, teamData] = await Promise.all([
        matchService.getAllMatches(),
        teamService.getAllTeams() 
      ]);
      
      const teamMap = {};
      teamData.forEach(t => teamMap[t.id] = t.name);
      
            
      const sortedMatches = [...matchData].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
      });
      setTeams(teamMap);
      setMatches(sortedMatches);
    } catch (err) {
      console.error("Error loading data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      try {
        await matchService.deleteMatch(id);
        fetchData(); 
      } catch (err) {
        console.error("Deletion error:", err);
        alert("Error during deletion.");
      }
    }
  };

  const handleBooking = async () => {
    setBookingLoading(true);
    try {
      const userData = localStorage.getItem('user');
      const user = userData ? JSON.parse(userData) : null;

      if (!user?.id) {
        alert("You must be logged in to make a reservation.");
        return;
      }
      
      // Payload matching ReservationEntity.java
      const data = {
        userId: Number(user.id),
        matchId: Number(selectedMatch.id),
        seatNumber: "Standard" 
      };

      const result = await reservationService.createReservation(data);
      setReservationId(result.id);
    } catch (error) {
      const serverMessage = error.response?.data?.message || "";
      const isMailError = serverMessage.toLowerCase().includes("mail");

      // Handle cases where DB save succeeds but Mail service fails
      if (error.response?.status === 500 && isMailError) {
        console.warn("Reservation saved in DB, but email delivery failed.");
        setReservationId("SUCCESS_DB"); 
        alert("Reservation recorded! A technical error occurred while sending the confirmation email, but your seat is reserved.");
      } else {
        console.error("Booking error:", error.response?.data || error.message);
        alert("An error occurred during the booking process: " + (error.response?.data?.error || "Server Error"));
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const upcomingMatches = matches.filter(m => m.date >= today && m.snitchCaughtByTeamId === null);
  const pastMatches = matches.filter(m => m.date < today || (m.snitchCaughtByTeamId !== null));

  const MatchCard = ({ match, isPast }) => (
    <Card className={`bg-white border-none shadow-md border-t-4 ${isPast ? 'border-slate-300' : 'border-indigo-600'}`}>
      <CardContent className="p-6">
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar size={14} />
            <span className="text-[10px] font-bold uppercase">{match.date}</span>
          </div>
            {isManager && !isPast && 
           match.homeScore === null && 
           match.awayScore === null && 
           match.homeTeamId !== null && 
           match.awayTeamId !== null && (
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={async () => {
                  try {
                    await matchService.startMatch(match.id);
                    fetchData(); // Sayfayı yenilemek için verileri tekrar çekiyoruz
                  } catch (err) {
                    console.error("Error starting match:", err);
                    alert("Could not start the match.");
                  }
                }}
              >
                <Play size={18} className="text-slate-300 hover:text-green-600"/>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { setEditingMatch(match); setIsDialogOpen(true); }}>
                <Edit size={18} className="text-slate-300 hover:text-indigo-600"/>
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(match.id)}>
                <Trash2 size={18} className="text-slate-300 hover:text-red-600"/>
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between font-black text-lg text-slate-800 uppercase italic">
          <span className="flex-1 text-left">{teams[match.homeTeamId] || "TBD"}</span>
          <span className="px-4 text-indigo-600 text-xs font-bold">VS</span>
          <span className="flex-1 text-right">{teams[match.awayTeamId] || "TBD"}</span>
        </div>

          {!isPast && (
          <div className="mt-6">
            {match.homeScore !== null && match.awayScore !== null ? (
              match.snitchCaughtByTeamId === null ? (
                /* Snitch yakalanmadıysa Live butonu */
                <Button
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-widest animate-pulse"
                  onClick={() => navigate(`/live`)}
                >
                  Go To Live Section
                </Button>
              ) : (
                /* Maç tamamen bittiyse Skor görünümü */
                <div className="w-full py-2 bg-slate-100 rounded-lg text-center">
                  <span className="text-slate-900 font-black text-xl tracking-tighter">
                    {match.homeScore} — {match.awayScore}
                  </span>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Final Score</p>
                </div>
              )
            ) : (
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-[10px] tracking-widest"
              onClick={() => {
                setReservationId(null);
                setSelectedMatch(match);
                setIsBookingOpen(true);
              }}
            >
              <Ticket size={14} className="mr-2" /> Book Now
            </Button>
            )}
          </div>
        )}        
        {isPast && (
          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-center">
            <div className="text-center bg-slate-100 px-4 py-1 rounded-full">
              <p className="text-lg font-black text-slate-600">
                {match.homeScore} - {match.awayScore}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) return (
    <div className="p-10 text-center font-bold text-indigo-600 uppercase tracking-widest">
      <Loader2 className="animate-spin inline mr-2"/> Loading Matches...
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">Matches</h1>
          {isManager && (
            <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if(!v) setEditingMatch(null); }}>
                {/*<DialogTrigger asChild>
                  <Button className="bg-indigo-600 text-white font-bold shadow-lg">
                  <Plus size={20} className="mr-2"/> New Match
                </Button>
              </DialogTrigger>*/}
              <DialogContent className="bg-white">
                <DialogHeader>
                   <DialogTitle className="uppercase italic font-bold text-indigo-900">
                     {editingMatch ? "Edit Match" : "Schedule Match"}
                   </DialogTitle>
                   <DialogDescription>Enter the match details for the tournament.</DialogDescription>
                </DialogHeader>
                <MatchForm initialData={editingMatch} onSuccess={() => { setIsDialogOpen(false); fetchData(); }} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <section className="mb-12">
          <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-6 border-l-4 border-indigo-600 pl-3">Upcoming Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.length > 0 ? upcomingMatches.map(m => <MatchCard key={m.id} match={m} isPast={false} />) : <p className="text-slate-400 italic">No matches scheduled.</p>}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-l-4 border-slate-300 pl-3">Past Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastMatches.map(m => <MatchCard key={m.id} match={m} isPast={true} />)}
          </div>
        </section>

        <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
          <DialogContent className="bg-white max-w-md">
            <DialogHeader>
              <DialogTitle className="uppercase italic font-black text-blue-600 tracking-tighter text-2xl">
                {reservationId ? "Booking Confirmed" : "Confirm Booking"}
              </DialogTitle>
              <DialogDescription>
                You are about to book a seat for this event.
              </DialogDescription>
            </DialogHeader>
            
            {!reservationId ? (
              <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center text-slate-800 font-bold uppercase text-sm border-b pb-4">
                  <span>{teams[selectedMatch?.homeTeamId]}</span>
                  <span className="text-blue-600 italic">VS</span>
                  <span>{teams[selectedMatch?.awayTeamId]}</span>
                </div>
                <Button 
                  onClick={handleBooking} 
                  disabled={bookingLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase py-6"
                >
                  {bookingLoading ? <Loader2 className="animate-spin mr-2" /> : "Confirm Reservation"}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4 py-6">
                <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket size={32} />
                </div>
                <p className="text-slate-600 font-medium">Show this code at the ticket office:</p>
                <div className="bg-slate-100 p-4 rounded-lg font-mono text-3xl font-black text-blue-600 border-2 border-dashed border-blue-200">
                  #{reservationId}
                </div>
                <Button onClick={() => setIsBookingOpen(false)} className="w-full bg-slate-900 mt-4 uppercase font-bold">
                  Got it
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}