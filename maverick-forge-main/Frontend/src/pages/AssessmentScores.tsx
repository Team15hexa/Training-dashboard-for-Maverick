import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useDarkMode } from "@/contexts/DarkModeContext";
import {
  BarChart3,
  Search,
  Brain,
  TrendingUp,
  TrendingDown,
  Award,
  Users,
  Activity
} from "lucide-react";

interface DepartmentData {
  department: string;
  overallScore: number;
  quizAverage: number;
  assignmentAverage: number;
  totalFreshers: number;
  aiInsight: string;
}

const AssessmentScores = () => {
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { darkMode, toggleDarkMode, isTransitioning } = useDarkMode();
  const { toast } = useToast();

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/fresher/');
      if (!response.ok) {
        throw new Error('Failed to fetch fresher data');
      }
      
      const freshers = await response.json();
      
      // Group freshers by department and calculate metrics
      const departmentGroups = freshers.reduce((acc: any, fresher: any) => {
        const dept = fresher.department || 'Unknown';
        if (!acc[dept]) {
          acc[dept] = {
            freshers: [],
            quizScores: [],
            assignmentScores: []
          };
        }
        acc[dept].freshers.push(fresher);
        acc[dept].quizScores.push(parseInt(fresher.quizzes) || 0);
        acc[dept].assignmentScores.push(parseInt(fresher.assignments) || 0);
        return acc;
      }, {});

      // Transform to department data format
      const transformedData: DepartmentData[] = Object.entries(departmentGroups).map(([dept, data]: [string, any]) => {
        const quizAverage = data.quizScores.reduce((sum: number, score: number) => sum + score, 0) / data.quizScores.length;
        const assignmentAverage = data.assignmentScores.reduce((sum: number, score: number) => sum + score, 0) / data.assignmentScores.length;
        const overallScore = Math.round((quizAverage + assignmentAverage) / 2);

        // Generate AI insight based on performance
        let aiInsight = "";
        if (overallScore >= 90) {
          aiInsight = "Outstanding performance across all metrics";
        } else if (overallScore >= 70) {
          aiInsight = "Good performance with room for improvement";
        } else if (overallScore >= 40) {
          aiInsight = "Requires focused attention and support";
        } else {
          aiInsight = "Requires immediate attention and support";
        }

        return {
          department: dept,
          overallScore,
          quizAverage: Math.round(quizAverage),
          assignmentAverage: Math.round(assignmentAverage),
          totalFreshers: data.freshers.length,
          aiInsight
        };
      });

      setDepartmentData(transformedData);
    } catch (err) {
      console.error('Error fetching assessment data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assessment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessmentData();
  }, []);

  // Listen for dashboard refresh triggers
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'dashboardRefresh') {
        console.log('🔍 Assessment Scores refresh triggered');
        fetchAssessmentData();
      }
    };

    // Check for refresh trigger on mount
    const refreshTrigger = localStorage.getItem('dashboardRefresh');
    if (refreshTrigger) {
      console.log('🔍 Assessment Scores refresh detected on mount');
      fetchAssessmentData();
      localStorage.removeItem('dashboardRefresh');
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const filteredDepartments = departmentData.filter(dept =>
    dept.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-blue-100 text-blue-800";
    if (score >= 40) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50'}`}>
        <Sidebar darkMode={darkMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading assessment scores...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50'}`}>
        <Sidebar darkMode={darkMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Data Error</h3>
            <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50'}`}>
      <Sidebar darkMode={darkMode} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className={`p-6 border-b transition-all duration-300 backdrop-blur-sm ${
          darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Assessment Scores
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Performance metrics across different departments with neon highlighting
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                variant="outline"
                onClick={fetchAssessmentData}
                disabled={loading}
                className={`transition-all duration-300 ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </Button>

            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {/* Bar Chart Section */}
                      <Card className={`transition-all duration-300 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
            }`}>
              <CardHeader>
                <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Assessment Performance by Department
                </CardTitle>
                <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Performance metrics across different departments with neon highlighting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-80 p-6">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
                    <span>100%</span>
                    <span>75%</span>
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                  </div>
                  
                  {/* Y-axis line */}
                  <div className="absolute left-8 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                  
                  {/* X-axis line */}
                  <div className="absolute left-8 right-0 bottom-8 h-px bg-gray-300 dark:bg-gray-600"></div>
                  
                  {/* Chart area */}
                  <div className="ml-12 h-64 flex items-end justify-between">
                    {filteredDepartments.map((dept, index) => (
                      <div key={index} className="flex flex-col items-center group relative">
                        {/* Neon glow effect on hover */}
                        <div className="absolute inset-0 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
                             style={{
                               background: 'linear-gradient(45deg, #00ffff, #0080ff)',
                               height: `${(dept.overallScore / 100) * 200 + 20}px`,
                               width: '80px',
                               top: '-10px',
                               left: '-8px',
                               zIndex: -1
                             }}>
                        </div>
                        
                        {/* Main bar */}
                        <div 
                          className="w-16 rounded-t-lg transition-all duration-500 ease-in-out transform hover:scale-110 cursor-pointer relative z-10"
                          style={{ 
                            height: `${(dept.overallScore / 100) * 200}px`,
                            background: 'linear-gradient(180deg, #00ffff 0%, #0080ff 100%)',
                            boxShadow: '0 0 20px rgba(0, 255, 255, 0.6)'
                          }}
                        ></div>
                        
                        {/* Hover tooltip */}
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-1 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
                          {dept.department}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
                        </div>
                        
                        {/* Department name */}
                        <div className={`mt-2 text-xs font-medium text-center transition-colors duration-300 group-hover:text-cyan-600 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {dept.department}
                        </div>
                        
                        {/* Percentage score */}
                        <div className={`text-xs font-bold transition-all duration-300 group-hover:scale-110 group-hover:text-cyan-600 ${getScoreColor(dept.overallScore)}`}>
                          {dept.overallScore}%
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* X-axis title */}
                  <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Departments
                  </div>
                  
                  {/* Y-axis title */}
                  <div className="absolute left-0 top-1/2 transform -translate-x-8 -translate-y-1/2 rotate-90 text-sm text-gray-500 dark:text-gray-400">
                    Performance Score (%)
                  </div>
                </div>
              </CardContent>
            </Card>

                     {/* Department Cards Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredDepartments.map((dept, index) => (
               <Card key={index} className={`group transition-all duration-500 ease-in-out transform hover:scale-105 hover:shadow-2xl hover:-translate-y-2 ${
                 darkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-blue-500' : 'bg-white hover:bg-blue-50 hover:border-blue-300'
               }`}>
                 <CardHeader className="pb-3">
                   <div className="flex items-center justify-between">
                     <CardTitle className={`text-lg font-bold capitalize transition-colors duration-300 group-hover:text-blue-600 ${
                       darkMode ? 'text-white group-hover:text-blue-400' : 'text-gray-900'
                     }`}>
                       {dept.department}
                     </CardTitle>
                     <div className={`text-2xl font-bold transition-all duration-300 group-hover:scale-110 ${getScoreColor(dept.overallScore)}`}>
                       {dept.overallScore}%
                     </div>
                   </div>
                 </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="space-y-2">
                     <div className="flex justify-between items-center transition-all duration-300 group-hover:bg-opacity-10 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 p-2 rounded">
                       <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'}`}>
                         Quiz Average:
                       </span>
                       <span className={`font-semibold transition-all duration-300 group-hover:scale-105 ${getScoreColor(dept.quizAverage)}`}>
                         {dept.quizAverage}%
                       </span>
                     </div>
                     <div className="flex justify-between items-center transition-all duration-300 group-hover:bg-opacity-10 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 p-2 rounded">
                       <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'}`}>
                         Assignment Average:
                       </span>
                       <span className={`font-semibold transition-all duration-300 group-hover:scale-105 ${getScoreColor(dept.assignmentAverage)}`}>
                         {dept.assignmentAverage}%
                       </span>
                     </div>
                     <div className="flex justify-between items-center transition-all duration-300 group-hover:bg-opacity-10 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 p-2 rounded">
                       <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'}`}>
                         Total Freshers:
                       </span>
                       <span className={`font-semibold transition-all duration-300 group-hover:scale-105 ${darkMode ? 'text-white group-hover:text-blue-300' : 'text-gray-900 group-hover:text-blue-600'}`}>
                         {dept.totalFreshers}
                       </span>
                     </div>
                   </div>
                   
                   <div className="pt-3 border-t border-gray-200 dark:border-gray-700 group-hover:border-blue-300 dark:group-hover:border-blue-600 transition-colors duration-300">
                     <div className="flex items-start gap-2">
                       <Brain className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0 transition-all duration-300 group-hover:text-blue-600 group-hover:scale-110 group-hover:animate-pulse" />
                       <div>
                         <span className={`text-xs font-semibold transition-colors duration-300 ${darkMode ? 'text-gray-300 group-hover:text-blue-400' : 'text-gray-700 group-hover:text-blue-600'}`}>
                           AI Insight:
                         </span>
                         <p className={`text-xs mt-1 transition-colors duration-300 ${darkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-700'}`}>
                           {dept.aiInsight}
                         </p>
                       </div>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             ))}
           </div>

          {/* AI Analysis Summary */}
          <Card className={`transition-all duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    AI Analysis Summary:
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Performance calculated using advanced algorithms analyzing quiz scores, assignment completion rates, and department-specific patterns. {
                      departmentData.length > 0 ? 
                      `${departmentData.sort((a, b) => b.overallScore - a.overallScore)[0].department} leads with ${departmentData.sort((a, b) => b.overallScore - a.overallScore)[0].overallScore}% performance (${departmentData.sort((a, b) => b.overallScore - a.overallScore)[0].overallScore >= 90 ? 'Excellent' : departmentData.sort((a, b) => b.overallScore - a.overallScore)[0].overallScore >= 70 ? 'Good' : 'Needs Improvement'} level).` : 
                      'No data available for analysis.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AssessmentScores; 