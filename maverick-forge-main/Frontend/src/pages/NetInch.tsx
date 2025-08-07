import React, { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import MetricCards from "@/components/MetricCards";
import BarChartComponent from "@/components/BarChartComponent";
import PieChartComponent from "@/components/PieChartComponent";
import LineChartComponent from "@/components/LineChartComponent";
import RadarChartComponent from "@/components/RadarChartComponent";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { Moon, Sun } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NetInchData {
  summaryCards: Array<{
    title: string;
    value: string;
    icon: string;
    color: string;
  }>;
  recentFreshers: Array<{
    id: number;
    name: string;
    department: string;
    role: string;
    skills: string;
    join_date: string;
  }>;
  freshers: Array<{
    id: number;
    name: string;
    department: string;
    role: string;
    skills: string;
    join_date: string;
  }>;
  departmentStats: Record<string, number>;
  systemMetrics: {
    database: string;
    apiServices: string;
    responseTime: string;
    uptime: string;
  };
}

const NetInch: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { toast } = useToast();
  const [netInchData, setNetInchData] = useState<NetInchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch NetInch analytics data from backend
  const fetchNetInchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setNetInchData(data);
      
      toast({
        title: "Success",
        description: "NetInch analytics data loaded successfully",
      });
      
    } catch (error) {
      console.error('Error fetching NetInch data:', error);
      setError('Failed to load NetInch analytics data. Please check your connection.');
      toast({
        title: "Error",
        description: "Failed to load NetInch analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetInchData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={`flex h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50'}`}>
        <Sidebar darkMode={darkMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading NetInch analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50'}`}>
        <Sidebar darkMode={darkMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sun className="w-8 h-8 text-red-600" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>NetInch Analytics Error</h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
            <button
              onClick={fetchNetInchData}
              className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                darkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50'}`}>
      <Sidebar darkMode={darkMode} />
      
      <div className="flex-1 overflow-auto">
        {/* Header Section */}
        <div className={`shadow-sm border-b transition-all duration-300 backdrop-blur-sm ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold transition-all duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  NetInch Analytics
                </h1>
                <p className={`mt-1 transition-all duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Advanced Statistics & Department Insights
                </p>
                {netInchData && (
                  <p className={`text-sm mt-2 transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Last updated: {new Date().toLocaleString()}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchNetInchData}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  Refresh Data
                </button>
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Metric Cards */}
          <MetricCards data={netInchData} />

          {/* Middle Section - Two Charts Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BarChartComponent data={netInchData} />
            <PieChartComponent data={netInchData} />
          </div>

          {/* Bottom Section - Two More Charts Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChartComponent />
            <RadarChartComponent />
          </div>

          {/* Data Summary Section */}
          {netInchData && (
            <div className={`mt-8 rounded-lg transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6">
                <h3 className={`text-lg font-semibold mb-4 transition-all duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Data Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className={`text-2xl font-bold transition-all duration-300 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {netInchData.freshers?.length || 0}
                    </p>
                    <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Total Freshers
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold transition-all duration-300 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {Object.keys(netInchData.departmentStats || {}).length}
                    </p>
                    <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Departments
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold transition-all duration-300 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {netInchData.systemMetrics?.responseTime || 'N/A'}
                    </p>
                    <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Response Time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NetInch; 