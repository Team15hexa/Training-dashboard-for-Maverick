import React, { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Users, BookOpen, Award, FileText, Sparkles, BarChart3, User, Search, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardData {
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

const AdminDashboard: React.FC = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    toast({ 
      title: "Logged out successfully",
      description: "You have been logged out successfully."
    });
    navigate("/login");
  };
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const freshersPerPage = 10;

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
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
      setDashboardData(data);
      
      toast({
        title: "Success",
        description: "Dashboard data loaded successfully",
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please check your connection.');
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter and paginate freshers
  const filteredFreshers = dashboardData?.freshers?.filter(fresher =>
    fresher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fresher.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fresher.role.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredFreshers.length / freshersPerPage);
  const startIndex = (currentPage - 1) * freshersPerPage;
  const endIndex = startIndex + freshersPerPage;
  const currentFreshers = filteredFreshers.slice(startIndex, endIndex);

  // Loading state
  if (loading) {
    return (
      <div className={`flex h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Sidebar darkMode={darkMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`flex h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Sidebar darkMode={darkMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Dashboard Error</h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
            <button
              onClick={fetchDashboardData}
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
    <div className={`flex h-screen transition-all duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      <Sidebar darkMode={darkMode} />
      
      <div className="flex-1 overflow-auto">
        {/* Header Section */}
        <div className={`shadow-sm border-b transition-all duration-300 backdrop-blur-sm ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${darkMode ? 'bg-blue-600' : 'bg-blue-500'}`}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className={`text-2xl font-bold transition-all duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    Admin Dashboard
                  </h1>
                  <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Training Management Overview
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
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
                
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                    darkMode 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                >
                  <LogOut size={20} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Summary Cards - Top Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardData?.summaryCards.map((card, index) => (
              <div key={index} className={`transition-all duration-300 hover:shadow-lg rounded-lg p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-medium transition-all duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {card.title}
                  </h3>
                  {card.icon === 'Users' && <Users className="w-4 h-4 text-blue-600" />}
                  {card.icon === 'BookOpen' && <BookOpen className="w-4 h-4 text-green-600" />}
                  {card.icon === 'Award' && <Award className="w-4 h-4 text-purple-600" />}
                  {card.icon === 'FileText' && <FileText className="w-4 h-4 text-orange-600" />}
                </div>
                <div className={`text-2xl font-bold transition-all duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {card.value}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className={`${card.color} h-2 rounded-full`} style={{width: `${Math.min(parseInt(card.value) * 10, 100)}%`}}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard Overview Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <div>
                <h2 className={`text-xl font-semibold transition-all duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Dashboard Overview
                </h2>
                <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Key metrics and insights for training management
                </p>
              </div>
            </div>
            
            {/* Large Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`bg-blue-500 text-white transition-all duration-300 hover:shadow-lg rounded-lg p-6`}>
                <h3 className="text-white text-lg font-medium">Total Freshers</h3>
                <div className="text-3xl font-bold mb-2">{dashboardData?.summaryCards.find(card => card.title === 'Total Freshers')?.value || '0'}</div>
                <p className="text-blue-100 text-sm">Across all departments</p>
              </div>

              <div className={`bg-green-500 text-white transition-all duration-300 hover:shadow-lg rounded-lg p-6`}>
                <h3 className="text-white text-lg font-medium">Active Quizzes</h3>
                <div className="text-3xl font-bold mb-2">{dashboardData?.summaryCards.find(card => card.title === 'Active Quizzes')?.value || '0'}</div>
                <p className="text-green-100 text-sm">Ongoing assessments</p>
              </div>

              <div className={`bg-purple-500 text-white transition-all duration-300 hover:shadow-lg rounded-lg p-6`}>
                <h3 className="text-white text-lg font-medium">Coding Challenges</h3>
                <div className="text-3xl font-bold mb-2">{dashboardData?.summaryCards.find(card => card.title === 'Coding Challenges')?.value || '0'}</div>
                <p className="text-purple-100 text-sm">Technical assessments</p>
              </div>

              <div className={`bg-orange-500 text-white transition-all duration-300 hover:shadow-lg rounded-lg p-6`}>
                <h3 className="text-white text-lg font-medium">Pending Assignments</h3>
                <div className="text-3xl font-bold mb-2">{dashboardData?.summaryCards.find(card => card.title === 'Assignments')?.value || '0'}</div>
                <p className="text-orange-100 text-sm">Awaiting submission</p>
              </div>
            </div>
          </div>

          {/* All Freshers Section */}
          <div className={`transition-all duration-300 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className={`text-lg font-semibold transition-all duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    All Freshers ({dashboardData?.freshers?.length || 0})
                  </h3>
                  <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    All freshers in the training program
                  </p>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="text"
                    placeholder="Search freshers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-10 pr-4 py-2 border rounded-lg transition-all duration-300 ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                {currentFreshers.map((fresher) => (
                  <div key={fresher.id} className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${darkMode ? 'bg-gray-600' : 'bg-blue-100'}`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`font-medium transition-all duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {fresher.name}
                        </p>
                        <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {fresher.department}
                        </p>
                        {fresher.skills && (
                          <p className={`text-xs transition-all duration-300 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            Skills: {fresher.skills}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 ${darkMode ? 'bg-gray-600 text-gray-300' : 'bg-blue-100 text-blue-800'}`}>
                        {fresher.role}
                      </span>
                      {fresher.join_date && (
                        <span className={`text-xs transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Joined: {new Date(fresher.join_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!dashboardData?.freshers || dashboardData.freshers.length === 0) && (
                  <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No freshers found</p>
                  </div>
                )}

                {filteredFreshers.length === 0 && searchTerm && (
                  <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No freshers found matching "{searchTerm}"</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredFreshers.length)} of {filteredFreshers.length} freshers
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded transition-all duration-300 ${
                        currentPage === 1
                          ? 'opacity-50 cursor-not-allowed'
                          : darkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      Previous
                    </button>
                    <span className={`px-3 py-1 rounded transition-all duration-300 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                      {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'opacity-50 cursor-not-allowed'
                          : darkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          {dashboardData?.systemMetrics && (
            <div className={`transition-all duration-300 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className="p-6">
                <h3 className={`text-lg font-semibold mb-4 transition-all duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  System Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Database</p>
                    <p className={`font-semibold transition-all duration-300 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {dashboardData.systemMetrics.database}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>API Services</p>
                    <p className={`font-semibold transition-all duration-300 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {dashboardData.systemMetrics.apiServices}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Response Time</p>
                    <p className={`font-semibold transition-all duration-300 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      {dashboardData.systemMetrics.responseTime}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Uptime</p>
                    <p className={`font-semibold transition-all duration-300 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {dashboardData.systemMetrics.uptime}
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

export default AdminDashboard;
