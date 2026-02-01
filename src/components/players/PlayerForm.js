import React, { useState, useEffect } from "react";
import playerService from "../../services/playerService";
import teamService from "../../services/teamService"; 
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Save, Loader2, AlertCircle } from "lucide-react";

const PlayerForm = ({ initialData, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teams, setTeams] = useState([]); // state to memorize teams
  const [loadingTeams, setLoadingTeams] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    position: "",
    jerseyNumber: "",
    team_id: "", 
  });

  // list of teams 
  useEffect(() => {
    const loadTeams = async () => {
      try {
        const data = await teamService.getAllTeams();
        setTeams(data);
      } catch (err) {
        console.error("Error loading teams for dropdown:", err);
      } finally {
        setLoadingTeams(false);
      }
    };
    loadTeams();
  }, []);

  useEffect(() => {
    if (initialData) {
      const names = initialData.name ? initialData.name.split(" ") : ["", ""];
      setFormData({
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        position: initialData.position || "",
        jerseyNumber: initialData.jerseyNumber || "",
        team_id: initialData.team_id?.toString() || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.team_id) {
      setError("Please select a team.");
      return;
    }

    setLoading(true);

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
      if (err.response?.status === 403) {
        setError("Access Denied: You don't have permission to perform this action.");
      } else {
        setError(err.response?.data?.message || "Error saving player. Ensure all data is correct.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm font-bold flex items-center gap-2">
          <AlertCircle size={18} /> {error}
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
          <Select 
            onValueChange={(val) => setFormData({...formData, position: val})} 
            value={formData.position}
          >
            <SelectTrigger><SelectValue placeholder="Select Role" /></SelectTrigger>
            <SelectContent className="bg-white"> 
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

      {/* Select team by name */}
      <div className="space-y-2">
        <Label>Assign to Team</Label>
        <Select 
          onValueChange={(val) => setFormData({...formData, team_id: val})} 
          value={formData.team_id}
          disabled={loadingTeams}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingTeams ? "Loading teams..." : "Choose a Team"} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id.toString()}>
                {team.name} ({team.city})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold" disabled={loading || loadingTeams}>
        {loading ? <Loader2 className="animate-spin" /> : <Save className="mr-2" />}
        {initialData ? "Update Athlete" : "Register Athlete"}
      </Button>
    </form>
  );
};

export default PlayerForm;