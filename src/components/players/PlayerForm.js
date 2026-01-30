import React, { useState, useEffect } from "react";
import playerService from "../../services/playerService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Save, Loader2 } from "lucide-react";

const PlayerForm = ({ initialData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    position: "",
    jerseyNumber: "",
    team_id: "1",
  });

  useEffect(() => {
    if (initialData) {
      const names = initialData.name ? initialData.name.split(" ") : ["", ""];
      setFormData({
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        position: initialData.position || "",
        jerseyNumber: initialData.jerseyNumber || "",
        team_id: initialData.team_id || "1",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Mapping for EntityPlayer.java
    const payload = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      position: formData.position,
      jerseyNumber: parseInt(formData.jerseyNumber),
      team_id: parseInt(formData.team_id)
    };

    try {
      if (initialData?.id) {
        await playerService.updatePlayer(initialData.id, payload);
      } else {
        await playerService.createPlayer(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Check if Team ID exists.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm">{error}</div>}
      
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
          <Select 
            onValueChange={(val) => setFormData({...formData, position: val})} 
            value={formData.position}
          >
            <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent className="bg-white z-[100]"> 
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

      <div className="space-y-2">
        <Label>Team ID</Label>
        <Input name="team_id" type="number" value={formData.team_id} onChange={handleChange} required />
      </div>

      <Button type="submit" className="w-full bg-blue-600" disabled={loading}>
        {loading ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
        {initialData ? "Update Athlete" : "Save Athlete"}
      </Button>
    </form>
  );
};

export default PlayerForm;