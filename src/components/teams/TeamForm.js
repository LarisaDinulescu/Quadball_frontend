import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Shield, MapPin, Calendar, ChevronLeft, Loader2 } from "lucide-react";
import teamService from '../../services/teamService';
import { cn } from "../../lib/utils";

const TeamForm = ({ initialData, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState(initialData || {
    name: '',
    city: '',
    foundationYear: new Date().getFullYear(),
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (initialData?.id) {
        // Implementa qui l'update se necessario
        // await teamService.updateTeam(initialData.id, formData);
      } else {
        await teamService.createTeam(formData);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/teams');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save team. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Se onSuccess esiste, siamo in un Modal: rimuoviamo i margini esterni
    <div className={cn("w-full bg-white", !onSuccess && "max-w-2xl mx-auto pt-10 px-4")}>
      
      {!onSuccess && (
        <Button 
          variant="ghost" 
          onClick={() => navigate('/teams')} 
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
        >
          <ChevronLeft size={20} /> Back to Teams
        </Button>
      )}

      <Card className={cn("border-none shadow-none", !onSuccess && "shadow-xl border-t-4 border-t-blue-600")}>
        <CardHeader className={cn(onSuccess && "p-0 pb-6")}>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Shield size={24} />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              {initialData ? "Edit Team" : "Register Team"}
            </CardTitle>
          </div>
          <CardDescription>
            Enter the official details to register this team in the league.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className={cn("space-y-5", onSuccess && "p-0")}>
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-800 font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Official Team Name</Label>
              <div className="relative group">
                <Input 
                  id="name"
                  name="name"
                  placeholder="e.g. Rome Titans"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 focus-visible:ring-blue-600 transition-all"
                />
                <Shield className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-semibold text-slate-700">Base City</Label>
                <div className="relative group">
                  <Input 
                    id="city"
                    name="city"
                    placeholder="e.g. Rome"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="pl-10 focus-visible:ring-blue-600"
                  />
                  <MapPin className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="foundationYear" className="text-sm font-semibold text-slate-700">Founded In</Label>
                <div className="relative group">
                  <Input 
                    id="foundationYear"
                    name="foundationYear"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear()}
                    required
                    value={formData.foundationYear}
                    onChange={handleChange}
                    className="pl-10 focus-visible:ring-blue-600"
                  />
                  <Calendar className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className={cn(
            "border-t p-6 mt-6 transition-colors",
            onSuccess ? "px-0 pb-0 bg-transparent border-none" : "bg-slate-50/50"
          )}>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold shadow-md hover:shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                initialData ? "Update Team Data" : "Confirm Registration"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default TeamForm;