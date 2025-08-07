import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/contexts/DarkModeContext";
import { RefreshCw, TrendingUp, Users, Award, ChevronDown, ChevronUp } from "lucide-react";

interface DepartmentCertificationData {
  department: string;
  totalFreshers: number;
  completedCertifications: number;
  notCompletedCertifications: number;
  completionRate: number;
}

interface BubbleData {
  x: number; // completion rate
  y: number; // total freshers
  r: number; // bubble radius (based on total freshers)
  department: string;
  completed: number;
  notCompleted: number;
  completionRate: number;
}

interface BubbleChartComponentProps {
  onExpansionChange?: (expanded: boolean) => void;
}

const BubbleChartComponent: React.FC<BubbleChartComponentProps> = ({ onExpansionChange }) => {
  const [data, setData] = useState<BubbleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const { darkMode } = useDarkMode();

  const fetchCertificationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/fresher/');
      if (!response.ok) {
        throw new Error('Failed to fetch fresher data');
      }
      
      const freshers = await response.json();
      
      // Group freshers by department and calculate certification metrics
      const departmentGroups = freshers.reduce((acc: any, fresher: any) => {
        const dept = fresher.department || 'Unknown';
        if (!acc[dept]) {
          acc[dept] = {
            freshers: [],
            completedCount: 0,
            notCompletedCount: 0
          };
        }
        acc[dept].freshers.push(fresher);
        
        // Count completed vs not completed certifications (100% threshold)
        const certScore = parseInt(fresher.certifications) || 0;
        if (certScore >= 100) {
          acc[dept].completedCount++;
        } else {
          acc[dept].notCompletedCount++;
        }
        
        return acc;
      }, {});

      // Transform to bubble chart data format
      const bubbleData: BubbleData[] = Object.entries(departmentGroups).map(([dept, data]: [string, any]) => {
        const totalFreshers = data.freshers.length;
        const completedCertifications = data.completedCount;
        const notCompletedCertifications = data.notCompletedCount;
        const completionRate = totalFreshers > 0 ? Math.round((completedCertifications / totalFreshers) * 100) : 0;

        return {
          x: completionRate, // X-axis: completion rate
          y: totalFreshers, // Y-axis: total freshers
          r: Math.max(20, totalFreshers * 8), // Radius based on total freshers (minimum 20px)
          department: dept,
          completed: completedCertifications,
          notCompleted: notCompletedCertifications,
          completionRate: completionRate
        };
      });

      setData(bubbleData);
    } catch (err) {
      console.error('Error fetching certification data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load certification data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificationData();
  }, []);

  // Notify parent of initial expansion state
  useEffect(() => {
    onExpansionChange?.(isExpanded);
  }, [isExpanded, onExpansionChange]);

  // Listen for dashboard refresh triggers
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dashboardRefresh') {
        console.log('🔍 Bubble chart refresh triggered');
        fetchCertificationData();
      }
    };

    // Check for refresh trigger on mount
    const refreshTrigger = localStorage.getItem('dashboardRefresh');
    if (refreshTrigger) {
      console.log('🔍 Bubble chart refresh detected on mount');
      fetchCertificationData();
      localStorage.removeItem('dashboardRefresh');
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getBubbleColor = (completionRate: number) => {
    if (completionRate >= 80) return "#10B981"; // Green for excellent
    if (completionRate >= 60) return "#3B82F6"; // Blue for good
    if (completionRate >= 40) return "#F59E0B"; // Yellow for average
    return "#EF4444"; // Red for needs improvement
  };

  const getBubbleOpacity = (completionRate: number) => {
    if (completionRate >= 80) return 0.9;
    if (completionRate >= 60) return 0.8;
    if (completionRate >= 40) return 0.7;
    return 0.6;
  };

  const getStatusText = (completionRate: number) => {
    if (completionRate >= 80) return "Excellent";
    if (completionRate >= 60) return "Good";
    if (completionRate >= 40) return "Average";
    return "Needs Improvement";
  };

  if (loading) {
    return (
      <Card className={`transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Department Certification Bubble Chart
          </CardTitle>
          <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Visual representation of certification completion by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading bubble chart data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <CardHeader>
          <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Department Certification Bubble Chart
          </CardTitle>
          <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Visual representation of certification completion by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-red-600" />
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Data Error</h3>
              <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
              <Button onClick={fetchCertificationData}>Try Again</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all duration-300 mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Department Certification Bubble Chart
              </CardTitle>
              <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Visual representation of certification completion by department
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newExpandedState = !isExpanded;
                setIsExpanded(newExpandedState);
                onExpansionChange?.(newExpandedState);
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
          <Button
            variant="outline"
            onClick={fetchCertificationData}
            disabled={loading}
            className={`transition-all duration-300 ${
              darkMode 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`space-y-6 transition-all duration-500 ease-in-out ${
          isExpanded ? 'opacity-100 max-h-none min-h-0' : 'opacity-0 max-h-0 overflow-hidden'
        }`}>
          {/* Chart Container */}
          <div className="relative h-96 border rounded-lg overflow-hidden animate-fade-in" style={{ animationDelay: '0.3s', minHeight: '384px' }}>
            <div className={`absolute inset-0 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {/* Grid Lines */}
              <svg className="w-full h-full" viewBox="0 0 400 300">
                {/* Grid lines for X-axis (completion rate) */}
                {[0, 25, 50, 75, 100].map((value) => (
                  <line
                    key={`x-${value}`}
                    x1={(value / 100) * 400}
                    y1="0"
                    x2={(value / 100) * 400}
                    y2="300"
                    stroke={darkMode ? "#374151" : "#E5E7EB"}
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                ))}
                
                {/* Grid lines for Y-axis (total freshers) */}
                {[0, 1, 2, 3, 4, 5].map((value) => (
                  <line
                    key={`y-${value}`}
                    x1="0"
                    y1={300 - (value / 5) * 300}
                    x2="400"
                    y2={300 - (value / 5) * 300}
                    stroke={darkMode ? "#374151" : "#E5E7EB"}
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                ))}

                {/* Bubbles with Animation */}
                {data.map((bubble, index) => (
                  <g key={index}>
                    <circle
                      cx={(bubble.x / 100) * 400}
                      cy={300 - (bubble.y / 5) * 300}
                      r={bubble.r}
                      fill={getBubbleColor(bubble.completionRate)}
                      opacity={getBubbleOpacity(bubble.completionRate)}
                      stroke={darkMode ? "#1F2937" : "#FFFFFF"}
                      strokeWidth="2"
                      className="transition-all duration-500 ease-out hover:opacity-100 cursor-pointer hover:scale-110"
                      style={{
                        animation: `bubbleFloat ${3 + index * 0.5}s ease-in-out infinite alternate`,
                        transformOrigin: 'center'
                      }}
                    />
                    <text
                      x={(bubble.x / 100) * 400}
                      y={300 - (bubble.y / 5) * 300}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={`text-xs font-semibold transition-all duration-300 ${darkMode ? 'fill-white' : 'fill-gray-900'}`}
                      style={{
                        animation: `textGlow ${2 + index * 0.3}s ease-in-out infinite alternate`
                      }}
                    >
                      {bubble.department}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>

          {/* CSS Animations */}
          <style jsx>{`
            @keyframes bubbleFloat {
              0% {
                transform: translateY(0px) scale(1);
              }
              50% {
                transform: translateY(-5px) scale(1.05);
              }
              100% {
                transform: translateY(0px) scale(1);
              }
            }
            
            @keyframes textGlow {
              0% {
                opacity: 0.8;
                filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.3));
              }
              100% {
                opacity: 1;
                filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.6));
              }
            }
            
            @keyframes pulse {
              0%, 100% {
                opacity: 0.6;
              }
              50% {
                opacity: 0.9;
              }
            }
            
            @keyframes slideInUp {
              0% {
                opacity: 0;
                transform: translateY(20px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes fadeIn {
              0% {
                opacity: 0;
                transform: translateY(10px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            .animate-fade-in {
              animation: fadeIn 0.6s ease-out forwards;
            }
          `}</style>

          {/* Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Excellent (80%+)</span>
            </div>
            <div className="flex items-center space-x-2 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Good (60-79%)</span>
            </div>
            <div className="flex items-center space-x-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse"></div>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Average (40-59%)</span>
            </div>
            <div className="flex items-center space-x-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Needs Improvement (&lt;40%)</span>
            </div>
          </div>

          {/* Data Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500 animate-bounce" style={{ animationDelay: '1s' }} />
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Total Departments: {data.length}
                </span>
              </div>
            </div>
            <div className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} style={{ animationDelay: '0.6s' }}>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-500 animate-bounce" style={{ animationDelay: '1.2s' }} />
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Avg Completion: {data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.completionRate, 0) / data.length) : 0}%
                </span>
              </div>
            </div>
            <div className={`p-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`} style={{ animationDelay: '0.7s' }}>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-purple-500 animate-bounce" style={{ animationDelay: '1.4s' }} />
                <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Total Freshers: {data.reduce((sum, d) => sum + d.y, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Department Details */}
          <div className="space-y-2">
            <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Department Details:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {data.map((dept, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all duration-500 hover:scale-105 hover:shadow-lg ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}
                  style={{ 
                    animationDelay: `${0.8 + index * 0.1}s`,
                    animation: 'slideInUp 0.6s ease-out forwards'
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {dept.department}
                    </span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      dept.completionRate >= 80 ? 'bg-green-100 text-green-800' :
                      dept.completionRate >= 60 ? 'bg-blue-100 text-blue-800' :
                      dept.completionRate >= 40 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getStatusText(dept.completionRate)}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Freshers:</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-900'}>{dept.y}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Completed:</span>
                      <span className="text-green-600 font-semibold">{dept.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Not Completed:</span>
                      <span className="text-red-600 font-semibold">{dept.notCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Rate:</span>
                      <span className={`font-bold ${getBubbleColor(dept.completionRate).startsWith('#') ? `text-[${getBubbleColor(dept.completionRate)}]` : 'text-blue-600'}`}>
                        {dept.completionRate}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BubbleChartComponent; 