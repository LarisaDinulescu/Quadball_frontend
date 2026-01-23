import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import playerService from "../../services/playerService";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Shield, ChevronLeft, UserPlus, Save, Loader2 } from "lucide-react";

const PlayerForm = ({ initialData, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState(initialData || {
    firstName: "",
    lastName: "",
    position: "",
    jerseyNumber: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Funzione specifica per gestire il cambio nel Select di Shadcn
  const handlePositionChange = (value) => {
    setFormData({ ...formData, position: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.position) {
      setError("Please select a position");
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      if (initialData?.id) {
        await playerService.updatePlayer(initialData.id, formData);
      } else {
        await playerService.createPlayer(formData);
      }
      onSuccess ? onSuccess() : navigate("/players");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save player.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white opacity-100">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="font-semibold text-slate-700">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="e.g. Harry"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="font-semibold text-slate-700">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="e.g. Potter"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MENU A TENDINA PER LA POSIZIONE */}
            <div className="space-y-2">
              <Label htmlFor="position" className="font-semibold text-slate-700">Position</Label>
              <Select 
                onValueChange={handlePositionChange} 
                defaultValue={formData.position}
                required
              >
                <SelectTrigger className="bg-white border-slate-200 focus:ring-blue-600">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-white opacity-100 shadow-xl border">
                  <SelectItem value="CHASER">Chaser</SelectItem>
                  <SelectItem value="BEATER">Beater</SelectItem>
                  <SelectItem value="KEEPER">Keeper</SelectItem>
                  <SelectItem value="SEEKER">Seeker</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jerseyNumber" className="font-semibold text-slate-700">Jersey Number</Label>
              <Input
                id="jerseyNumber"
                name="jerseyNumber"
                type="number"
                placeholder="0-99"
                required
                value={formData.jerseyNumber}
                onChange={handleChange}
                className="bg-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold transition-all flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? "Saving..." : initialData ? "Update Player" : "Save Player"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PlayerForm;