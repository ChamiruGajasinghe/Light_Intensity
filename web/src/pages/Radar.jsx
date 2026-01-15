import { useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Card, CardHeader, CardTitle } from "../components/Card";
import { FaCrosshairs } from "react-icons/fa6";
import RadarWidget from "../components/RadarWidget";

const Radar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-bg-dark text-text-dark">
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <main className="transition-all duration-300 ease-in-out lg:ml-[250px] pt-[60px] sm:pt-[80px] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-blue mb-6">
            Radar Scanner
          </h1>
          
          {/* Radar Widget Card */}
          <Card>
            <CardHeader>
              <CardTitle icon={FaCrosshairs} iconColor="text-primary-green">
                Real-time Radar Detection
              </CardTitle>
            </CardHeader>
            <div className="relative w-full" style={{ height: '600px' }}>
              <RadarWidget />
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Radar;
