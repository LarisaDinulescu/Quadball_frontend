import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import officialService from "../../services/officialService";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Save, Loader2, Calendar } from "lucide-react";

const OfficialForm = ({ initialData, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    birthDate: initialData?.birthDate || "",
    role: initialData?.role || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value) => {
    setFormData({ ...formData, role: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (initialData?.id) {
        await officialService.updateOfficial(initialData.id, formData);
      } else {
        await officialService.createOfficial(formData);
      }
      onSuccess ? onSuccess() : navigate("/officials");
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white p-4">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded border border-red-200 text-sm italic">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-slate-500">First Name</Label>
            <Input name="firstName" value={formData.firstName} onChange={handleChange} required className="border-slate-200" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-slate-500">Last Name</Label>
            <Input name="lastName" value={formData.lastName} onChange={handleChange} required className="border-slate-200" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-slate-500">Birth Date</Label>
            <div className="relative">
              <Input name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} className="border-slate-200" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase font-bold text-slate-500">Role</Label>
            <Select onValueChange={handleRoleChange} value={formData.role}>
              <SelectTrigger className="border-slate-200">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HEAD_REFEREE">Head Referee</SelectItem>
                <SelectItem value="ASSISTANT_REFEREE">Assistant Referee</SelectItem>
                <SelectItem value="SNAITCH_REFEREE">Snitch Referee</SelectItem>
                <SelectItem value="GOAL_REFEREE">Goal Referee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" className="w-full bg-slate-900 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-6 mt-2 transition-all" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="mr-2"/>}
          {initialData ? "Confirm Edit" : "Register Official"}
        </Button>
      </form>
    </div>
  );
};

export default OfficialForm;