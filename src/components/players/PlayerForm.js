import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import playerService from "../../services/playerService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Save, Loader2 } from "lucide-react";

const PlayerForm = ({ initialData, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lo stato interno gestisce firstName e lastName per la UI
  const [formData, setFormData] = useState({
    firstName: initialData?.name?.split(' ')[0] || "",
    lastName: initialData?.name?.split(' ').slice(1).join(' ') || "",
    position: initialData?.position || "",
    jerseyNumber: initialData?.jerseyNumber || "",
    team_id: initialData?.team_id || "1", // Valore temporaneo o ID di un team esistente
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePositionChange = (value) => {
    setFormData({ ...formData, position: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // MAPPATURA PER IL BACKEND (EntityPlayer)
    const payload = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      position: formData.position,
      jerseyNumber: parseInt(formData.jerseyNumber),
      team_id: parseInt(formData.team_id) // Obbligatorio per EntityPlayer!
    };

    try {
      if (initialData?.id) {
        await playerService.updatePlayer(initialData.id, payload);
      } else {
        await playerService.createPlayer(payload);
      }
      onSuccess ? onSuccess() : navigate("/players");
    } catch (err) {
      setError(err.response?.data?.message || "Error: check if Team ID exists.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Position</Label>
            <Select onValueChange={handlePositionChange} value={formData.position}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CHASER">Chaser</SelectItem>
                <SelectItem value="BEATER">Beater</SelectItem>
                <SelectItem value="KEEPER">Keeper</SelectItem>
                <SelectItem value="SEEKER">Seeker</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Jersey Number</Label>
            <Input name="jerseyNumber" type="number" value={formData.jerseyNumber} onChange={handleChange} required />
          </div>
        </div>

        {/* Campo temporaneo per team_id poiché è obbligatorio nel backend */}
        <div className="space-y-2">
          <Label>Team ID</Label>
          <Input name="team_id" type="number" value={formData.team_id} onChange={handleChange} required />
          <p className="text-[10px] text-slate-400 italic">Required by backend entity</p>
        </div>

        <Button type="submit" className="w-full bg-blue-600 font-bold py-6" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="mr-2"/>}
          {initialData ? "Update Athlete" : "Save Athlete"}
        </Button>
      </form>
    </div>
  );
};

export default PlayerForm;