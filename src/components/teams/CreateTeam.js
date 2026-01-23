import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import teamService from "../../services/teamService";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Shield, ChevronLeft, UserPlus, X, Save } from "lucide-react";

export default function CreateTeam() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [city, setCity] = useState("");
  const [members, setMembers] = useState([""]); // Iniziamo con un campo vuoto

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
      // Puliamo i membri vuoti prima di inviare
      const filteredMembers = members.filter(m => m.trim() !== "");
      await teamService.createTeam({ 
        name: teamName, 
        city: city,
        memberNames: filteredMembers 
      });
      navigate("/teams");
    } catch (err) {
      alert("Error creating team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <Button variant="ghost" onClick={() => navigate("/teams")} className="mb-6 gap-2">
        <ChevronLeft size={20} /> Back to Teams
      </Button>

      <Card className="shadow-2xl border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-blue-600" /> Initialize New Team
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8">
            {/* Dati Base */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Team Name</Label>
                <Input 
                  placeholder="e.g. Rome Titans" 
                  value={teamName} 
                  onChange={(e) => setTeamName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Home City</Label>
                <Input 
                  placeholder="e.g. Rome" 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  required 
                />
              </div>
            </div>

            <hr />

            {/* Gestione Membri */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-bold">Team Members</Label>
                <Button type="button" variant="outline" size="sm" onClick={addMemberField} className="gap-2">
                  <UserPlus size={16} /> Add Member
                </Button>
              </div>

              <div className="space-y-3">
                {members.map((member, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      placeholder={`Member #${index + 1} Name`}
                      value={member}
                      onChange={(e) => handleMemberChange(index, e.target.value)}
                      className="flex-1"
                    />
                    {members.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeMemberField(index)}
                        className="text-red-500 hover:bg-red-50"
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
              className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold"
              disabled={loading}
            >
              {loading ? "Creating..." : "Confirm & Register Team"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}