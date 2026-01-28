import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { User, Mail, Calendar, ShieldCheck, Ticket, Settings, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import reservationService from '../../services/reservationService';

const Profile = ({ user }) => {
  const navigate = useNavigate();
  const [myReservations, setMyReservations] = useState([]);
  const isManager = user?.roles?.includes === 'ROLE_ORGANIZATION_MANAGER';

  useEffect(() => {
    // Only fetch personal reservations if the user is not a manager 
    // (or fetch them anyway if managers can also book)
    if (user?.email) {
      reservationService.getUserReservations(user.email)
        .then(setMyReservations)
        .catch(err => console.error("Could not load reservations", err));
    }
  }, [user.email]);

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      {/* Profile Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-4 rounded-full text-white shadow-lg">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">
              Profile <span className="text-blue-600">Overview</span>
            </h1>
            <p className="text-slate-500 flex items-center gap-1">
              <ShieldCheck size={16} className="text-blue-600" />
              Role: <span className="font-semibold text-blue-600">{user.roles ? user.roles[0].replace('ROLE_', '').replace('_', ' ') : 'Not specified'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Personal Information */}
        <Card className="shadow-md border-none bg-white">
          <CardHeader className="pb-2 border-b mb-4">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User size={14} /> Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Full Name</p>
              <p className="text-lg font-bold text-slate-800">{user.name} {user.surname}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Date of Birth</p>
              <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" /> 
                {user.birthDate || "Not provided"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card className="shadow-md border-none bg-white">
          <CardHeader className="pb-2 border-b mb-4">
            <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Mail size={14} /> Account Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Email Address</p>
              <p className="text-lg font-bold text-slate-800 break-all">{user.email}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">Account Status</p>
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-700 uppercase">
                Active
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conditional Section: Manager Dashboard or User Tickets */}
      {isManager ? (
        <Card className="shadow-xl border-2 border-blue-600 bg-slate-900 text-white">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                <Settings className="text-blue-400" /> Management Tools
              </h2>
              <p className="text-slate-400">Access global reservations and system controls.</p>
            </div>
            <Button 
              onClick={() => navigate('/admin/reservations')}
              className="bg-blue-600 hover:bg-blue-500 font-bold px-8 py-6 text-lg transition-transform hover:scale-105"
            >
              Manage Reservations <ArrowRight className="ml-2" />
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-2">
            <Ticket className="text-blue-600" /> Your Tickets
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            {myReservations.length > 0 ? (
              myReservations.map((res) => (
                <Card key={res.id} className="border-none shadow-md bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="space-y-1 text-center md:text-left">
                      <p className="text-xl font-bold text-slate-800">{res.matchName || "Tournament Match"}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Calendar size={14}/> {res.date || "Upcoming"}</span>
                        <span className="font-bold text-blue-600 underline">Seats: {res.seatCount}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border-2 border-dashed border-slate-200 text-center min-w-[150px]">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Booking Code</p>
                      <p className="text-2xl font-mono font-black text-blue-600 tracking-tighter">#{res.id}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-dashed border-2 bg-transparent">
                <CardContent className="p-10 text-center text-slate-400 italic">
                  You haven't booked any matches yet. Visit the tournaments page to grab your tickets!
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;