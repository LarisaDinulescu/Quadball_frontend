import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";

// ⚠️ Adjust this to your backend base URL
const API_BASE_URL = "http://localhost:8080/api";

export default function StadiumPage() {
  const [stadiums, setStadiums] = useState([]);
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all stadiums
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/stadiums`)
      .then((res) => setStadiums(res.data))
      .catch((err) => console.error("Error fetching stadiums", err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch stadium details
  const loadStadiumDetails = async (stadiumId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/stadiums/${stadiumId}`);
      setSelectedStadium(res.data);
    } catch (error) {
      console.error("Error fetching stadium details", error);
    }
  };

  if (loading) {
    return <div className="p-6 text-slate-600">Loading stadiums...</div>;
  }

  // =====================
  // STADIUM LIST VIEW
  // =====================
  if (!selectedStadium) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <h1 className="text-3xl font-bold mb-6">Stadiums</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stadiums.map((stadium) => (
            <Card
              key={stadium.id}
              className="cursor-pointer rounded-2xl hover:shadow-lg transition"
              onClick={() => loadStadiumDetails(stadium.id)}
            >
              <CardContent className="p-6 space-y-2">
                <h2 className="text-xl font-semibold">{stadium.name}</h2>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={16} />
                  <span>{stadium.address}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // =====================
  // STADIUM DETAIL VIEW
  // =====================
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => setSelectedStadium(null)}
      >
        <ArrowLeft className="mr-2" size={16} /> Back to stadiums
      </Button>

      <h1 className="text-3xl font-bold mb-6">{selectedStadium.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Location */}
        <Card className="rounded-2xl">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-xl font-semibold">Location</h2>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin size={18} />
              <span>{selectedStadium.address}</span>
            </div>
          </CardContent>
        </Card>

        {/* Next match */}
        <Card className="rounded-2xl">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-xl font-semibold">Next match</h2>
            {selectedStadium.nextMatch ? (
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar size={18} />
                <span>{selectedStadium.nextMatch}</span>
              </div>
            ) : (
              <p className="text-slate-500">No upcoming matches</p>
            )}
          </CardContent>
        </Card>

        {/* Past matches */}
        <Card className="rounded-2xl">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-xl font-semibold">Past matches</h2>
            {selectedStadium.pastMatches?.length > 0 ? (
              <ul className="list-disc list-inside text-slate-700">
                {selectedStadium.pastMatches.map((match, index) => (
                  <li key={index}>{match}</li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500">No past matches</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
