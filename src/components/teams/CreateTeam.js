import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import teamService from "../../services/teamService";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Shield, ChevronLeft, UserPlus, X, Loader2, Save } from "lucide-react";

export default function CreateTeam() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: ""
  });
  const [members, setMembers] = useState([""]);

  // Fetch data if in Edit Mode
  useEffect(() => {
    if (id) {
      const fetchTeamData = async () => {
        setFetching(true);
        try {
          const data = await teamService.getTeamById(id);
          setFormData({
            name: data.name || "",
            city: data.city || ""
          });
          
          // Populate members if they exist in the backend response
          if (data.memberNames && data.memberNames.length > 0) {
            setMembers(data.memberNames);
          } else if (data.players) {
            setMembers(data.players.map(p => p.name || p));
          }
        } catch (err) {
          console.error("Error fetching team details:", err);
          alert("Could not load team data. Redirecting...");
          navigate("/teams");
        } finally {
          setFetching(false);
        }
      };
      fetchTeamData();
    }
  }, [id, navigate]);

  // Member Management Logic
  const addMemberField = () => setMembers([...members, ""]);
  
  const handleMemberChange = (index, value) => {
    const updatedMembers = [...members];
    updatedMembers[index] = value;
    setMembers(updatedMembers);
  };

  const removeMemberField = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const payload = {
      name: formData.name,
      city: formData.city,
      nation: formData.city, 
    };

    if (id) {
      await teamService.updateTeam(id, payload);
    } else {
      await teamService.createTeam(payload);
    }
    
    navigate("/teams");

    } catch (err) {
      const errorMsg = err.response?.data?.message || "An error occurred while saving.";
      alert(`Action Failed: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/teams")} 
        className="mb-6 gap-2 text-slate-500 hover:text-slate-900"
      >
        <ChevronLeft size={20} /> Back to Teams
      </Button>

      <Card className="shadow-2xl border-t-4 border-t-blue-600 bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2 uppercase italic tracking-tighter">
            <Shield className="text-blue-600" /> 
            {id ? "Edit Team Details" : "Register New Team"}
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            {/* Base Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Team Name</Label>
                <Input 
                  placeholder="e.g. London Lions" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required 
                  className="border-slate-200 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Home City</Label>
                <Input 
                  placeholder="e.g. London" 
                  value={formData.city} 
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required 
                  className="border-slate-200 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full" />

            {/* Roster Management Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-bold uppercase text-slate-700">Roster / Members</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addMemberField} 
                  className="gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <UserPlus size={16} /> Add Player
                </Button>
              </div>

              <div className="space-y-3">
                {members.map((member, index) => (
                  <div key={index} className="flex gap-2 animate-in fade-in slide-in-from-left-2">
                    <Input 
                      placeholder={`Player Name #${index + 1}`}
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                      className="flex-1 border-slate-200"
                    />
                    {members.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeMemberField(index)}
                        className="text-slate-300 hover:text-red-500 hover:bg-red-50"
                      >
                        <X size={18} />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50 border-t p-6">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-black uppercase tracking-widest text-white shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Save className="mr-2" size={20} />
              )}
              {id ? "Update Team" : "Confirm Registration"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}