import React, { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Users, BookOpen, Award, FileText, Sparkles, BarChart3, User, Search, LogOut, Building2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddDepartmentModal } from "@/components/admin/AddDepartmentModal";
import LoginActivityChart, { LoginActivityPoint } from "@/components/LoginActivityChart";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authAPI } from "@/services/api";

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
  realtimeMetrics?: {
    windowSec: number;
    avgLatencyMs: number;
    p95LatencyMs: number;
    errorRatePercent: number;
    requestsPerSecond: number;
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
      description: "You have been logged out successfully.",
      duration: 3000
    });
    navigate("/login");
  };
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const freshersPerPage = 10;
  const [realtimeMetrics, setRealtimeMetrics] = useState<DashboardData['realtimeMetrics'] | null>(null);
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginDialogTitle, setLoginDialogTitle] = useState('');
  const [loginActivity, setLoginActivity] = useState<LoginActivityPoint[]>([]);
  const [loginActivityLoading, setLoginActivityLoading] = useState(false);

  const openLoginActivity = async (fresherId: number, fresherName: string) => {
    try {
      setLoginDialogTitle(`${fresherName}'s Login Activity`);
      setLoginDialogOpen(true);
      setLoginActivityLoading(true);
      const res = await authAPI.getLoginActivity(fresherId);
      if (res?.success && Array.isArray(res.data)) {
        setLoginActivity(res.data);
      } else if (Array.isArray(res)) {
        setLoginActivity(res as unknown as LoginActivityPoint[]);
      } else {
        setLoginActivity([]);
      }
    } catch {
      setLoginActivity([]);
    } finally {
      setLoginActivityLoading(false);
    }
  };

  // Normalize skills field from DB (can be JSON array, comma-separated string, or empty)
  const formatSkills = (skills: unknown): string => {
    if (skills == null) return '';
    // If already an array
    if (Array.isArray(skills)) {
      return (skills as unknown[]).map(String).filter(Boolean).join(', ');
    }
    const raw = String(skills).trim();
    if (!raw) return '';
    // Try JSON parse first
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((s: any) => String(s)).filter(Boolean).join(', ');
      }
    } catch {}
    // Fallback: remove surrounding brackets/quotes and split by comma
    return raw
      .replace(/^\[/, '')
      .replace(/\]$/, '')
      .replace(/"/g, '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .join(', ');
  };

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
        duration: 3000
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please check your connection.');
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Poll real-time metrics
  useEffect(() => {
    let isCancelled = false;
    const fetchMetrics = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/metrics?windowSec=300');
        if (!res.ok) return;
        const json = await res.json();
        const m = json?.metrics;
        if (!isCancelled && m) {
          setRealtimeMetrics({
            windowSec: json.windowSec,
            avgLatencyMs: m.avgLatencyMs,
            p95LatencyMs: m.p95LatencyMs,
            errorRatePercent: m.errorRatePercent,
            requestsPerSecond: m.requestsPerSecond,
          });
        }
      } catch {}
    };
    fetchMetrics();
    const id = setInterval(fetchMetrics, 3000);
    return () => { isCancelled = true; clearInterval(id); };
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

  // Helper: count how many freshers have 100% in a given metric
  const countPerfect = (key: 'quizzes' | 'coding' | 'assignments' | 'certifications') => {
    const list = dashboardData?.freshers || [];
    return list.reduce((acc, f: any) => {
      const value = parseInt(String((f as any)[key] ?? 0));
      return acc + (value === 100 ? 1 : 0);
    }, 0);
  };

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div 
                className={`group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 text-white transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-2 rounded-xl p-6 cursor-pointer`}
                style={{
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(59, 130, 246, 0.4), 0 0 30px rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <h3 className="text-white text-lg font-medium transition-all duration-300 group-hover:scale-105">Total Freshers</h3>
                  <div className="text-3xl font-bold mb-2 transition-all duration-300 group-hover:scale-110">{dashboardData?.freshers?.length ?? 0}</div>
                  <p className="text-blue-100 text-sm transition-all duration-300 group-hover:text-blue-50">Across all departments</p>
                </div>
              </div>

              <div 
                className={`group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-2 rounded-xl p-6 cursor-pointer`}
                style={{
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(16, 185, 129, 0.4), 0 0 30px rgba(16, 185, 129, 0.3)';
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(16, 185, 129, 0.3)';
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <h3 className="text-white text-lg font-medium transition-all duration-300 group-hover:scale-105">Quiz Completed (100%)</h3>
                  <div className="text-3xl font-bold mb-2 transition-all duration-300 group-hover:scale-110">{countPerfect('quizzes')}</div>
                  <p className="text-green-100 text-sm transition-all duration-300 group-hover:text-green-50">Freshers with full score</p>
                </div>
              </div>

              <div 
                className={`group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 text-white transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-2 rounded-xl p-6 cursor-pointer`}
                style={{
                  boxShadow: '0 8px 25px rgba(168, 85, 247, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(168, 85, 247, 0.4), 0 0 30px rgba(168, 85, 247, 0.3)';
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(168, 85, 247, 0.3)';
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <h3 className="text-white text-lg font-medium transition-all duration-300 group-hover:scale-105">Coding 100%</h3>
                  <div className="text-3xl font-bold mb-2 transition-all duration-300 group-hover:scale-110">{countPerfect('coding')}</div>
                  <p className="text-purple-100 text-sm transition-all duration-300 group-hover:text-purple-50">Freshers with full score</p>
                </div>
              </div>

              <div 
                className={`group relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-2 rounded-xl p-6 cursor-pointer`}
                style={{
                  boxShadow: '0 8px 25px rgba(249, 115, 22, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(249, 115, 22, 0.4), 0 0 30px rgba(249, 115, 22, 0.3)';
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(249, 115, 22, 0.3)';
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <h3 className="text-white text-lg font-medium transition-all duration-300 group-hover:scale-105">Assignments 100%</h3>
                  <div className="text-3xl font-bold mb-2 transition-all duration-300 group-hover:scale-110">{countPerfect('assignments')}</div>
                  <p className="text-orange-100 text-sm transition-all duration-300 group-hover:text-orange-50">Freshers with full score</p>
                </div>
              </div>

              <div 
                className={`group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 text-white transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-2 rounded-xl p-6 cursor-pointer`}
                style={{
                  boxShadow: '0 8px 25px rgba(99, 102, 241, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.4), 0 0 30px rgba(99, 102, 241, 0.3)';
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(99, 102, 241, 0.3)';
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <h3 className="text-white text-lg font-medium transition-all duration-300 group-hover:scale-105">Certifications 100%</h3>
                  <div className="text-3xl font-bold mb-2 transition-all duration-300 group-hover:scale-110">{countPerfect('certifications')}</div>
                  <p className="text-indigo-100 text-sm transition-all duration-300 group-hover:text-indigo-50">Freshers with full score</p>
                </div>
              </div>
            </div>
          </div>

          {/* All Freshers Section */}
          <div className={`group relative overflow-hidden rounded-3xl transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700/50 hover:border-gray-600/60' 
              : 'bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border border-gray-200/50 hover:border-gray-300/70'
          }`}
          style={{
            backdropFilter: 'blur(20px)',
            boxShadow: darkMode 
              ? '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
              : '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = darkMode 
              ? '0 25px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
              : '0 25px 80px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = darkMode 
              ? '0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
              : '0 20px 60px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
          }}>
            {/* Static decorative elements */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-gradient-to-br from-pink-400/10 to-blue-400/10 rounded-full blur-3xl" />
            </div>
            
            <div className="relative z-10 p-8">
              <div className="flex items-center justify-between mb-8">
                                  <div className="flex items-center gap-6">
                    <div className={`p-4 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-blue-600 shadow-2xl transition-all duration-300 group-hover:scale-105`}
                    style={{
                      boxShadow: '0 10px 30px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
                    }}>
                      <Users className="w-8 h-8 text-white transition-all duration-300 group-hover:rotate-3" />
                    </div>
                    <div>
                      <h3 className={`text-3xl font-bold mb-2 transition-all duration-300 group-hover:scale-105 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                      style={{
                        background: darkMode 
                          ? 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)' 
                          : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        All Freshers ({dashboardData?.freshers?.length || 0})
                      </h3>
                      <p className={`text-base transition-all duration-300 group-hover:text-blue-500 ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        All freshers in the training program
                      </p>
                    </div>
                  </div>
                
                {/* Enhanced Search Bar */}
                <div className="relative group">
                  <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                    darkMode 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20' 
                      : 'bg-gradient-to-r from-blue-100/50 to-purple-100/50'
                  } blur-xl opacity-0 group-hover:opacity-100`} />
                  <div className="relative">
                    <Search className={`absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 transition-all duration-300 ${
                      darkMode ? 'text-gray-400 group-hover:text-blue-400' : 'text-gray-500 group-hover:text-blue-500'
                    }`} />
                    <input
                      type="text"
                      placeholder="Search freshers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-14 pr-8 py-4 border-2 rounded-2xl text-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/30 ${
                        darkMode 
                          ? 'bg-gray-700/90 border-gray-600/50 text-white placeholder-gray-400 focus:border-blue-500/50 hover:border-blue-400/60' 
                          : 'bg-white/90 border-gray-300/50 text-gray-900 placeholder-gray-500 focus:border-blue-500/50 hover:border-blue-400/60'
                      }`}
                      style={{
                        boxShadow: darkMode 
                          ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
                          : '0 4px 20px rgba(0, 0, 0, 0.1)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = darkMode 
                          ? '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.2)' 
                          : '0 8px 30px rgba(0, 0, 0, 0.15), 0 0 20px rgba(59, 130, 246, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = darkMode 
                          ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
                          : '0 4px 20px rgba(0, 0, 0, 0.1)';
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {currentFreshers.map((fresher, index) => (
                  <div 
                    key={fresher.id} 
                    className={`group relative overflow-hidden flex items-center justify-between p-8 rounded-3xl transition-all duration-300 cursor-pointer ${
                      darkMode 
                        ? 'bg-gradient-to-r from-gray-700/90 via-gray-800/90 to-gray-700/90 border border-gray-600/40 hover:border-gray-500/50' 
                        : 'bg-gradient-to-r from-white/95 via-blue-50/20 to-purple-50/20 border border-gray-200/60 hover:border-gray-300/70'
                    }`}
                    style={{
                      backdropFilter: 'blur(15px)',
                      boxShadow: darkMode 
                        ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                        : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = darkMode 
                        ? '0 16px 48px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 20px rgba(59, 130, 246, 0.1)' 
                        : '0 16px 48px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8), 0 0 20px rgba(59, 130, 246, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = darkMode 
                        ? '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                        : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
                    }}
                  >
                    {/* Static decorative background */}
                    <div className="absolute inset-0">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-2xl" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-2xl" />
                    </div>
                    
                    <div className="relative z-10 flex items-center gap-6 flex-1">
                      {/* Enhanced Avatar */}
                      <div className={`relative w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 ${
                        darkMode 
                          ? 'bg-gradient-to-br from-blue-500 via-purple-600 to-blue-600 shadow-2xl' 
                          : 'bg-gradient-to-br from-blue-100 via-purple-100 to-blue-200 shadow-xl'
                      }`}
                      style={{
                        boxShadow: darkMode 
                          ? '0 8px 25px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                          : '0 8px 25px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = darkMode 
                          ? '0 12px 35px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                          : '0 12px 35px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = darkMode 
                          ? '0 8px 25px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                          : '0 8px 25px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.8)';
                      }}>
                        <User className={`w-8 h-8 transition-all duration-300 group-hover:rotate-3 ${
                          darkMode ? 'text-white' : 'text-blue-600'
                        }`} />
                        {/* Static ring */}
                        <div className={`absolute inset-0 rounded-3xl border-2 transition-all duration-300 group-hover:border-blue-400/50 ${
                          darkMode ? 'border-blue-400/30' : 'border-blue-300/50'
                        }`} />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className={`text-xl font-bold mb-2 transition-all duration-300 group-hover:scale-105 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}
                        style={{
                          background: darkMode 
                            ? 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)' 
                            : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>
                          {fresher.name}
                        </h4>
                        <p className={`text-base font-medium mb-1 transition-all duration-300 group-hover:text-blue-500 ${
                          darkMode ? 'text-blue-300' : 'text-blue-600'
                        }`}>
                          {fresher.department}
                        </p>
                        {fresher.skills && (
                          <div className="mt-3">
                            <p className={`text-sm transition-all duration-300 group-hover:text-gray-500 ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              <span className="font-medium">Skills:</span> {formatSkills(fresher.skills)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="relative z-10 flex items-center gap-4">
                      {/* Enhanced Role Badge */}
                      <button
                        onClick={() => openLoginActivity(fresher.id, fresher.name)}
                        className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group-hover:scale-105 ${
                          darkMode 
                            ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200 border border-blue-400/40' 
                            : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200'
                        }`}
                        style={{
                          boxShadow: darkMode 
                            ? '0 4px 15px rgba(59, 130, 246, 0.2)' 
                            : '0 4px 15px rgba(59, 130, 246, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = darkMode 
                            ? '0 8px 25px rgba(59, 130, 246, 0.3)' 
                            : '0 8px 25px rgba(59, 130, 246, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = darkMode 
                            ? '0 4px 15px rgba(59, 130, 246, 0.2)' 
                            : '0 4px 15px rgba(59, 130, 246, 0.1)';
                        }}
                        aria-label="Show fresher login activity"
                        title="Show fresher login activity"
                      >
                        {fresher.role}
                      </button>
                      
                      {/* Enhanced Join Date */}
                      {fresher.join_date && (
                        <div className={`text-sm ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              darkMode ? 'bg-green-400' : 'bg-green-500'
                            }`} />
                            <span className="font-medium">Joined:</span> {new Date(fresher.join_date).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!dashboardData?.freshers || dashboardData.freshers.length === 0) && (
                  <div className={`relative text-center py-16 px-8 rounded-3xl ${
                    darkMode 
                      ? 'bg-gradient-to-br from-gray-700/80 via-gray-800/80 to-gray-700/80 border border-gray-600/40' 
                      : 'bg-gradient-to-br from-white/95 via-blue-50/30 to-purple-50/30 border border-gray-200/60'
                  }`}
                  style={{
                    backdropFilter: 'blur(15px)',
                    boxShadow: darkMode 
                      ? '0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                      : '0 12px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  }}>
                    <div className="relative z-10">
                      <div className={`w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-600 to-blue-600 flex items-center justify-center`}
                      style={{
                        boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}>
                        <Users className="w-10 h-10 text-white" />
                      </div>
                      <h3 className={`text-2xl font-bold mb-4 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                      style={{
                        background: darkMode 
                          ? 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)' 
                          : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        No Freshers Yet
                      </h3>
                      <p className={`text-lg ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Start by adding freshers to your training program
                      </p>
                    </div>
                    {/* Static decorative elements */}
                    <div className="absolute inset-0">
                      <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl" />
                      <div className="absolute top-12 right-10 w-12 h-12 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl" />
                      <div className="absolute bottom-10 left-1/3 w-8 h-8 bg-gradient-to-br from-pink-400/10 to-blue-400/10 rounded-full blur-2xl" />
                    </div>
                  </div>
                )}

                {filteredFreshers.length === 0 && searchTerm && (
                  <div className={`relative text-center py-16 px-8 rounded-3xl ${
                    darkMode 
                      ? 'bg-gradient-to-br from-gray-700/80 via-gray-800/80 to-gray-700/80 border border-gray-600/40' 
                      : 'bg-gradient-to-br from-white/95 via-orange-50/30 to-red-50/30 border border-gray-200/60'
                  }`}
                  style={{
                    backdropFilter: 'blur(15px)',
                    boxShadow: darkMode 
                      ? '0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                      : '0 12px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  }}>
                    <div className="relative z-10">
                      <div className={`w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-orange-500 via-red-600 to-orange-600 flex items-center justify-center`}
                      style={{
                        boxShadow: '0 10px 30px rgba(249, 115, 22, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      }}>
                        <Search className="w-10 h-10 text-white" />
                      </div>
                      <h3 className={`text-2xl font-bold mb-4 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                      style={{
                        background: darkMode 
                          ? 'linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%)' 
                          : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                      }}>
                        No Results Found
                      </h3>
                      <p className={`text-lg ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        No freshers found matching "<span className="font-bold text-blue-500">{searchTerm}</span>"
                      </p>
                    </div>
                    {/* Static decorative elements */}
                    <div className="absolute inset-0">
                      <div className="absolute top-8 left-8 w-16 h-16 bg-gradient-to-br from-orange-400/10 to-red-400/10 rounded-full blur-2xl" />
                      <div className="absolute top-12 right-10 w-12 h-12 bg-gradient-to-br from-red-400/10 to-yellow-400/10 rounded-full blur-2xl" />
                      <div className="absolute bottom-10 left-1/3 w-8 h-8 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl" />
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Pagination */}
              {totalPages > 1 && (
                <div className={`relative flex items-center justify-between mt-10 p-8 rounded-3xl ${
                  darkMode 
                    ? 'bg-gradient-to-r from-gray-700/80 via-gray-800/80 to-gray-700/80 border border-gray-600/40' 
                    : 'bg-gradient-to-r from-white/95 via-blue-50/30 to-purple-50/30 border border-gray-200/60'
                }`}
                style={{
                  backdropFilter: 'blur(15px)',
                  boxShadow: darkMode 
                    ? '0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                    : '0 12px 40px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                }}>
                  {/* Static decorative background */}
                  <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-3xl" />
                  </div>
                  
                  <div className="relative z-10 flex items-center gap-6">
                    <div className={`text-base font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      <span className="font-bold text-blue-500">
                        {startIndex + 1} - {Math.min(endIndex, filteredFreshers.length)}
                      </span> of <span className="font-bold">{filteredFreshers.length}</span> freshers
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex items-center gap-4">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                        currentPage === 1
                          ? 'opacity-50 cursor-not-allowed'
                          : darkMode
                            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 hover:from-gray-500 hover:to-gray-600'
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                      }`}
                      style={{
                        boxShadow: currentPage === 1 ? 'none' : (darkMode 
                          ? '0 6px 20px rgba(0, 0, 0, 0.3)' 
                          : '0 6px 20px rgba(0, 0, 0, 0.15)')
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== 1) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = darkMode 
                            ? '0 10px 30px rgba(0, 0, 0, 0.4)' 
                            : '0 10px 30px rgba(0, 0, 0, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== 1) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = darkMode 
                            ? '0 6px 20px rgba(0, 0, 0, 0.3)' 
                            : '0 6px 20px rgba(0, 0, 0, 0.15)';
                        }
                      }}
                    >
                      Previous
                    </button>
                    
                    <div className={`px-8 py-3 rounded-2xl font-bold ${
                      darkMode 
                        ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 text-blue-200 border border-blue-400/40' 
                        : 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border border-blue-200'
                    }`}
                    style={{
                      boxShadow: darkMode 
                        ? '0 6px 20px rgba(59, 130, 246, 0.3)' 
                        : '0 6px 20px rgba(59, 130, 246, 0.2)'
                    }}>
                      {currentPage} of {totalPages}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 ${
                        currentPage === totalPages
                          ? 'opacity-50 cursor-not-allowed'
                          : darkMode
                            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300 hover:from-gray-500 hover:to-gray-600'
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
                      }`}
                      style={{
                        boxShadow: currentPage === totalPages ? 'none' : (darkMode 
                          ? '0 6px 20px rgba(0, 0, 0, 0.3)' 
                          : '0 6px 20px rgba(0, 0, 0, 0.15)')
                      }}
                      onMouseEnter={(e) => {
                        if (currentPage !== totalPages) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = darkMode 
                            ? '0 10px 30px rgba(0, 0, 0, 0.4)' 
                            : '0 10px 30px rgba(0, 0, 0, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentPage !== totalPages) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = darkMode 
                            ? '0 6px 20px rgba(0, 0, 0, 0.3)' 
                            : '0 6px 20px rgba(0, 0, 0, 0.15)';
                        }
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Status */}
          {(dashboardData?.systemMetrics || realtimeMetrics) && (
            <div className={`transition-all duration-300 rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <div className="p-6">
                <h3 className={`text-lg font-semibold mb-4 transition-all duration-300 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  System Status
                </h3>
                <div className={`grid grid-cols-2 md:grid-cols-6 gap-4`}>
                  {dashboardData?.systemMetrics && (
                    <>
                      <div className="text-center">
                        <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Database</p>
                        <p className={`font-semibold transition-all duration-300 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {dashboardData?.systemMetrics?.database || '—'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>API Services</p>
                        <p className={`font-semibold transition-all duration-300 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {dashboardData?.systemMetrics?.apiServices || '—'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Response Time</p>
                        <p className={`font-semibold transition-all duration-300 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {dashboardData?.systemMetrics?.responseTime || '—'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Uptime</p>
                        <p className={`font-semibold transition-all duration-300 ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {dashboardData?.systemMetrics?.uptime || '—'}
                        </p>
                      </div>
                    </>
                  )}
                  {realtimeMetrics && (
                    <>
                      <div className="text-center">
                        <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Latency</p>
                        <p className={`font-semibold transition-all duration-300 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          {realtimeMetrics.avgLatencyMs.toFixed(0)}ms
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm transition-all duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Error Rate</p>
                        <p className={`font-semibold transition-all duration-300 ${realtimeMetrics.errorRatePercent > 2 ? (darkMode ? 'text-red-400' : 'text-red-600') : (darkMode ? 'text-green-400' : 'text-green-600')}`}>
                          {realtimeMetrics.errorRatePercent.toFixed(2)}%
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
        <DialogContent className={darkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <DialogHeader>
            <DialogTitle className={darkMode ? 'text-white' : ''}>{loginDialogTitle}</DialogTitle>
          </DialogHeader>
          {loginActivityLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <LoginActivityChart activity={loginActivity} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
