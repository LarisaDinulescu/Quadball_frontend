import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Trophy, Calendar, MapPin, ChevronLeft } from "lucide-react";
import tournamentService from '../../services/tournamentService';

const CreateTournament = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    date: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await tournamentService.createTournament(formData);
      // Redirect back to the tournaments list after success
      navigate('/tournaments');
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create tournament. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-10 px-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/tournaments')} 
        className="mb-6 flex items-center gap-2 text-slate-600"
      >
        <ChevronLeft size={20} /> Back to List
      </Button>

      <Card className="shadow-xl border-t-4 border-t-blue-600">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Trophy size={24} />
            </div>
            <CardTitle className="text-2xl font-bold">New Tournament</CardTitle>
          </div>
          <CardDescription>
            Fill in the details below to initialize a new competition.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Tournament Name</Label>
              <div className="relative">
                <Input 
                  id="name"
                  name="name"
                  placeholder="e.g. Winter Quadball Cup 2026"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                />
                <Trophy className="absolute left-3 top-2.5 text-slate-400" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="date">Start Date</Label>
                <div className="relative">
                  <Input 
                    id="date"
                    name="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <Input 
                    id="location"
                    name="location"
                    placeholder="City or Stadium"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    className="pl-10"
                  />
                  <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50/50 border-t p-6 mt-6">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold transition-all"
              disabled={loading}
            >
              {loading ? "Creating..." : "Confirm & Create Tournament"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateTournament;