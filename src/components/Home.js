import React from 'react';
import { Button } from './ui/button'; 
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[90vh] w-full flex items-center justify-center">
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/banner.png" 
            alt="Quadball Stadium" 
            className="w-full h-full object-cover brightness-[0.3]"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mt-[-64px]"> 
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight mb-6">
            QUADBALL <span className="text-blue-600">LIVE</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-300 mb-10 leading-relaxed">
            Explore stadiums, follow tournaments in real-time, and learn more about your team. 
          </p>

          {/* New Button Section */}
          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="h-14 px-10 text-lg font-bold shadow-2xl bg-blue-600 hover:bg-blue-700 text-white transition-all transform hover:scale-105"
              onClick={() => navigate('/tournaments')}
            >
              See Tournaments
            </Button>
          </div>
        </div>
      </section>

      {/* Additional Static Section */}
      <section className="py-20 bg-white text-center">
        <h2 className="text-3xl font-bold text-gray-900">Upcoming Tournaments</h2>
        <p className="text-gray-600 mt-2">Stay updated on all events for the 2026 season.</p>
      </section>
    </div>
  );
};

export default Home;