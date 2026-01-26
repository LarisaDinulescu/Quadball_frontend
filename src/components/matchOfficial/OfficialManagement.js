import React, { useState, useEffect } from 'react';
import { Plus, ShieldCheck, Loader2, Trash2, Edit, CalendarDays } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

import officialService from "../../services/officialService";
import OfficialForm from "./OfficialForm"; 

const OfficialManagement = () => {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOfficial, setSelectedOfficial] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isManager = user?.role === 'ROLE_ORGANIZATION_MANAGER';

  const fetchOfficials = async () => {
    try {
      setLoading(true);
      const data = await officialService.getAllOfficials();
      setOfficials(data);
    } catch (error) {
      console.error("Error fetching officials:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficials();
  }, []);

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setSelectedOfficial(null);
    fetchOfficials();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this official?")) {
      try {
        await officialService.deleteOfficialById(id);
        fetchOfficials();
      } catch (error) {
        console.error("Error deleting official:", error);
      }
    }
  };

  return (
    <div className="space-y-6 bg-slate-50 min-h-screen p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900">
            Match Officials
          </h2>
          <p className="text-slate-500 text-sm font-medium">Referee & Technical Staff Management</p>
        </div>
        
        {isManager && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setSelectedOfficial(null);
          }}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg font-bold px-6 text-white">
                <Plus size={20} /> Add Official
              </Button>
            </DialogTrigger>
            
            <DialogContent className="sm:max-w-[500px] bg-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-indigo-900">
                  {selectedOfficial ? "Edit Official" : "Register New Official"}
                </DialogTitle>
              </DialogHeader>
              <OfficialForm 
                initialData={selectedOfficial} 
                onSuccess={handleSuccess} 
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="animate-spin text-indigo-600" size={48} />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">Loading Officials...</p>
            </div>
          ) : officials.length === 0 ? (
            <div className="text-center py-24">
              <ShieldCheck size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 text-lg font-medium">No officials registered yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 border-b">
                <TableRow>
                  <TableHead className="font-bold text-slate-700 uppercase text-xs tracking-wider h-12">Official Name</TableHead>
                  <TableHead className="font-bold text-slate-700 uppercase text-xs tracking-wider h-12 text-center">Birth Date</TableHead>
                  <TableHead className="font-bold text-slate-700 uppercase text-xs tracking-wider h-12 text-center">Role</TableHead>
                  {isManager && <TableHead className="font-bold text-slate-700 uppercase text-xs tracking-wider h-12 text-right pr-8">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {officials.map((official) => (
                  <TableRow key={official.id} className="hover:bg-indigo-50/30 transition-colors border-b last:border-0">
                    <TableCell className="py-4 font-bold text-slate-900 uppercase tracking-tight">
                      {official.firstName} {official.lastName}
                    </TableCell>
                    <TableCell className="py-4 text-center text-slate-500 font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <CalendarDays size={14} className="text-slate-300" />
                        {official.birthDate || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <span className="px-3 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100 inline-block">
                        {official.role?.replace('_', ' ')}
                      </span>
                    </TableCell>
                    
                    {isManager && (
                      <TableCell className="py-4 text-right pr-8">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-indigo-600"
                            onClick={() => {
                              setSelectedOfficial(official);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit size={18} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-slate-400 hover:text-red-600"
                            onClick={() => handleDelete(official.id)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </TableCell>
                    )}
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

export default OfficialManagement;