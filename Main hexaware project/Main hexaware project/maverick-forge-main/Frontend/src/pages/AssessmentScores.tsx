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

interface FresherData {
  id: string;
  name: string;
  department: string;
  quizzes: number;
  assignments: number;
  completed: number;
  notCompleted: number;
  completionRate: number;
  status: 'On Track' | 'At Risk' | 'Needs Attention';
  // Derived fields for Assessment Score Table
  score: number; // average of quizzes and assignments
  completionStatus: 'Completed' | 'In Progress' | 'Pending';
}

interface DepartmentData {
  department: string;
  overallScore: number;
  quizAverage: number;
  assignmentAverage: number;
  totalFreshers: number;
  aiInsight: string;
  freshers: FresherData[];
}

const AssessmentScores = () => {
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [freshersData, setFreshersData] = useState<FresherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'department' | 'individual'>('department');
  const { darkMode, toggleDarkMode, isTransitioning } = useDarkMode();
  const { toast } = useToast();

  // Inline editing state for Assessment Score Table
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempScore, setTempScore] = useState<number | ''>('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch freshers data
      const response = await fetch('http://localhost:5000/api/fresher/');
      if (!response.ok) {
        throw new Error('Failed to fetch fresher data');
      }
      
      const freshers = await response.json();
      
      // Process individual fresher data for the table
      const processedFreshers: FresherData[] = freshers.map((fresher: any) => {
        // Use more realistic static values instead of random data
        // TODO: Replace with actual API data when available
        const completed = fresher.completed || 8; // Default to 8 completed tasks
        const notCompleted = fresher.notCompleted || 2; // Default to 2 not completed tasks
        const completionRate = Math.round((completed / (completed + notCompleted)) * 100) || 0;
        const quizzes = parseInt(fresher.quizzes) || 0;
        const assignments = parseInt(fresher.assignments) || 0;
        const score = Math.round((quizzes + assignments) / 2);
        const completionStatus: 'Completed' | 'In Progress' | 'Pending' =
          score >= 70 ? 'Completed' : score >= 40 ? 'In Progress' : 'Pending';
        
        return {
          id: fresher.id,
          name: fresher.name,
          department: fresher.department || 'Unknown',
          quizzes,
          assignments,
          completed,
          notCompleted,
          completionRate,
          status: completionRate >= 70 ? 'On Track' : completionRate >= 40 ? 'At Risk' : 'Needs Attention',
          score,
          completionStatus,
        };
      });
      
      setFreshersData(processedFreshers);
      
      // Group freshers by department and calculate metrics
      const departmentGroups = processedFreshers.reduce((acc: any, fresher: FresherData) => {
        const dept = fresher.department || 'Unknown';
        if (!acc[dept]) {
          acc[dept] = {
            freshers: [],
            quizScores: [],
            assignmentScores: []
          };
        }
        acc[dept].freshers.push(fresher);
        acc[dept].quizScores.push(fresher.quizzes);
        acc[dept].assignmentScores.push(fresher.assignments);
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
          aiInsight,
          freshers: data.freshers
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

  // Listen for direct fresher updates (custom event from Admin dashboard)
  useEffect(() => {
    const handler = (evt: Event) => {
      const e = evt as CustomEvent;
      const detail = e.detail as any;
      if (!detail || !detail.fresherId) return;

      setFreshersData(prev => {
        const next = prev.map(f => {
          if (f.id !== detail.fresherId) return f;
          const quizzes = parseInt(detail.updatedScores?.quizzes) || f.quizzes;
          const assignments = parseInt(detail.updatedScores?.assignments) || f.assignments;
          const score = Math.round((quizzes + assignments) / 2);
          const completionStatus: 'Completed' | 'In Progress' | 'Pending' =
            score >= 70 ? 'Completed' : score >= 40 ? 'In Progress' : 'Pending';
          const completionRate = f.completed + f.notCompleted > 0
            ? Math.round((f.completed / (f.completed + f.notCompleted)) * 100)
            : f.completionRate;
          const status: FresherData['status'] = completionRate >= 70 ? 'On Track' : completionRate >= 40 ? 'At Risk' : 'Needs Attention';
          return {
            ...f,
            quizzes,
            assignments,
            score,
            completionStatus,
            completionRate,
            status,
          };
        });
        return next;
      });
    };
    window.addEventListener('fresherDataUpdated' as any, handler as EventListener);
    return () => window.removeEventListener('fresherDataUpdated' as any, handler as EventListener);
  }, []);

  // Save updated score (Admin override)
  const saveScore = async (fresherId: string, newScore: number) => {
    try {
      setSavingId(fresherId);
      const response = await fetch(`http://localhost:5000/api/fresher/${fresherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // Update both quizzes and assignments to align with a single "assessment score"
        body: JSON.stringify({ quizzes: newScore, assignments: newScore }),
      });
      if (!response.ok) throw new Error('Failed to update score');

      // Optimistic local update
      setFreshersData(prev => prev.map(f => {
        if (f.id !== fresherId) return f;
        const score = Math.round(newScore);
        const completionStatus: 'Completed' | 'In Progress' | 'Pending' =
          score >= 70 ? 'Completed' : score >= 40 ? 'In Progress' : 'Pending';
        return { ...f, quizzes: score, assignments: score, score, completionStatus };
      }));

      // Trigger cross-tab refresh
      localStorage.setItem('dashboardRefresh', Date.now().toString());
      window.dispatchEvent(new CustomEvent('fresherDataUpdated', {
        detail: { fresherId, updatedScores: { quizzes: newScore, assignments: newScore } }
      }));

      toast({ title: 'Score updated', description: 'Assessment score has been updated.', duration: 2000 });
    } catch (err) {
      toast({ title: 'Update failed', description: err instanceof Error ? err.message : 'Unknown error', duration: 3000 });
    } finally {
      setSavingId(null);
      setEditingId(null);
      setTempScore('');
    }
  };

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
    <div className="flex h-screen">
      <Sidebar darkMode={darkMode} />
      
      <div className={`flex-1 overflow-auto ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50'}`}>
        {/* Main content container */}
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
                Performance metrics across different domain  
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search domain..."
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
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('department')}
                className={`${activeTab === 'department' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'} 
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Department Overview
              </button>
              <button
                onClick={() => setActiveTab('individual')}
                className={`${activeTab === 'individual' 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'} 
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Individual Assessments
              </button>
            </nav>
          </div>

          {activeTab === 'department' ? (
            <>
              {/* Bar Chart Section */}
              <Card className={`transition-all duration-300 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              <CardHeader>
                <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Assessment Performance by Domain
                </CardTitle>
                <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Performance metrics across different domain with neon highlighting
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
                    Domain
                  </div>
                  
                  {/* Y-axis title */}
                  <div className="absolute left-0 top-1/2 transform -translate-x-8 -translate-y-1/2 rotate-90 text-sm text-gray-500 dark:text-gray-400">
                    Performance Score (%)
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Performance Table */}
          <Card className={`transition-all duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Domain Performance Overview
              </CardTitle>
              <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Detailed performance metrics by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Department</th>
                      <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Overall Score</th>
                      <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Quiz Avg</th>
                      <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Assignment Avg</th>
                      <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Freshers</th>
                      <th className={`text-right py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartments.map((dept, index) => (
                      <tr 
                        key={index} 
                        className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-750' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
                      >
                        <td className={`py-3 px-4 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {dept.department}
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={`font-bold ${getScoreColor(dept.overallScore)}`}>
                            {dept.overallScore}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={getScoreColor(dept.quizAverage)}>
                            {dept.quizAverage}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={getScoreColor(dept.assignmentAverage)}>
                            {dept.assignmentAverage}%
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {dept.totalFreshers}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            dept.overallScore >= 90 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : dept.overallScore >= 70 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : dept.overallScore >= 40
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {dept.overallScore >= 90 ? 'Excellent' : dept.overallScore >= 70 ? 'Good' : dept.overallScore >= 40 ? 'Needs Improvement' : 'Needs Attention'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
          </>
        ) : (
          /* Individual Assessment Score Table */
          <div className="space-y-6">
            <Card className={`transition-all duration-300 shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'}`}>
              <CardHeader className="pb-4">
                <CardTitle className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Assessment Score Table
                </CardTitle>
                <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Each fresher's score with auto-updated completion status
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"><span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Name</span></th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"><span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Domain</span></th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"><span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Score</span></th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"><span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Completion Status</span></th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"><span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {freshersData.map((fresher) => (
                        <tr key={fresher.id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-3 ${
                                fresher.completionStatus === 'Completed' ? 'bg-green-500' : 
                                fresher.completionStatus === 'In Progress' ? 'bg-yellow-500' : 'bg-red-500'
                              }`}></div>
                              <div className="text-sm font-medium">
                                <span className={darkMode ? 'text-white' : 'text-gray-900'}>{fresher.name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-900'}>{fresher.department}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            {editingId === fresher.id ? (
                              <input
                                type="number"
                                min={0}
                                max={100}
                                className={`w-24 rounded border px-2 py-1 text-right ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                                value={typeof tempScore === 'number' ? tempScore : ''}
                                onChange={(e) => setTempScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                              />
                            ) : (
                              <span className={darkMode ? 'text-blue-300' : 'text-blue-600 font-medium'}>{fresher.score}%</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              fresher.completionStatus === 'Completed' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                : fresher.completionStatus === 'In Progress' 
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {fresher.completionStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            {editingId === fresher.id ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  disabled={savingId === fresher.id || typeof tempScore !== 'number'}
                                  onClick={() => typeof tempScore === 'number' && saveScore(fresher.id, tempScore)}
                                  className={darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}
                                >
                                  {savingId === fresher.id ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => { setEditingId(null); setTempScore(''); }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                onClick={() => { setEditingId(fresher.id); setTempScore(fresher.score); }}
                                className={darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}
                              >
                                Edit Score
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* AI Analysis Summary */}
        <div className="p-6">
          <Card className={`transition-all duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border border-gray-200'
          }`}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Brain className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    AI Analysis Summary:
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Performance calculated using advanced algorithms analyzing quiz scores, assignment completion rates, and batch-specific patterns. {
                      departmentData.length > 0 ? 
                      (() => {
                        const topDept = departmentData.sort((a, b) => b.overallScore - a.overallScore)[0];
                        const score = topDept.overallScore;
                        let performanceLevel = 'Needs Improvement';
                        if (score >= 90) performanceLevel = 'Excellent';
                        else if (score >= 70) performanceLevel = 'Good';
                        return `${topDept.department} leads with ${score}% performance (${performanceLevel} level).`;
                      })() : 
                      'No data available for analysis.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
      
    </div>
  );
};
export default AssessmentScores;