import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { User, Mail, Calendar, ShieldCheck } from "lucide-react";

// Added onNavigateToPlayers to the props
const Profile = ({ user, onNavigateToTeams, onNavigateToPlayers }) => {
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-600 p-4 rounded-full text-white shadow-lg">
          <User size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Your Profile</h1>
          <p className="text-slate-500 flex items-center gap-1">
            <ShieldCheck size={16} className="text-blue-600" />
            Role: <span className="font-semibold text-blue-600">{user.role || 'Not specified'}</span>
          </p>
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-l-4 border-l-blue-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <User size={14} /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-400">Full Name</p>
              <p className="text-lg font-semibold">{user.name} {user.surname}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Date of Birth</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <Calendar size={18} className="text-slate-400" /> 
                {/* If user.birthDate is a string like "2000-01-01", 
                  it will display directly. 
                */}
                {user.birthDate || "Not provided"}
              </p>
            </div>
            
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-blue-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Mail size={14} /> Contacts and Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-slate-400">System Email</p>
              <p className="text-lg font-semibold break-all">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Account Status</p>
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Active
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      
    </div>
  );
};

export default Profile;
