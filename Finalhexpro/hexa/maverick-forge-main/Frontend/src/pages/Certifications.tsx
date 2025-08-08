import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useDarkMode } from "@/contexts/DarkModeContext";
import BubbleChartComponent from "@/components/BubbleChartComponent";
import {
  Award,
  Search,
  CheckCircle,
  XCircle,
  Users,
  TrendingUp
} from "lucide-react";

interface DepartmentCertificationData {
  department: string;
  totalFreshers: number;
  completedCertifications: number;
  notCompletedCertifications: number;
  completionRate: number;
}

const Certifications = () => {
  const [departmentData, setDepartmentData] = useState<DepartmentCertificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [bubbleChartExpanded, setBubbleChartExpanded] = useState(true);
  const { darkMode, toggleDarkMode, isTransitioning } = useDarkMode();
  const { toast } = useToast();

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
        
        // Count completed vs not completed certifications
        const certScore = parseInt(fresher.certifications) || 0;
        if (certScore >= 100) {
          acc[dept].completedCount++;
        } else {
          acc[dept].notCompletedCount++;
        }
        
        return acc;
      }, {});

      // Transform to department data format
      const transformedData: DepartmentCertificationData[] = Object.entries(departmentGroups).map(([dept, data]: [string, any]) => {
        const totalFreshers = data.freshers.length;
        const completedCertifications = data.completedCount;
        const notCompletedCertifications = data.notCompletedCount;
        const completionRate = totalFreshers > 0 ? Math.round((completedCertifications / totalFreshers) * 100) : 0;

        return {
          department: dept,
          totalFreshers,
          completedCertifications,
          notCompletedCertifications,
          completionRate
        };
      });

      setDepartmentData(transformedData);
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



  const filteredDepartments = departmentData.filter(dept =>
    dept.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCompletionRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-blue-600";
    if (rate >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getCompletionRateBadge = (rate: number) => {
    if (rate >= 80) return { variant: "default", text: "Excellent" };
    if (rate >= 60) return { variant: "secondary", text: "Good" };
    if (rate >= 40) return { variant: "outline", text: "Average" };
    return { variant: "destructive", text: "Needs Improvement" };
  };

  if (loading) {
      return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50'}`}>
      <Sidebar darkMode={darkMode} />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading certification data...</p>
        </div>
      </div>
    </div>
  );
  }

  if (error) {
    return (
      <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50'}`}>
        <Sidebar darkMode={darkMode} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-red-600" />
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
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50'}`}>
      <Sidebar darkMode={darkMode} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className={`p-6 border-b transition-all duration-300 backdrop-blur-sm ${
          darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Certifications
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Track certification completion status across departments
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
                onClick={fetchCertificationData}
                disabled={loading}
                className={`transition-all duration-300 hover:animate-pulse neon-flicker-blue ${
                  darkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-purple-400 hover:shadow-purple-500/50' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-blue-400 hover:shadow-blue-500/50'
                }`}
              >
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </Button>
              
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={`transition-all duration-300 hover:shadow-lg hover:animate-pulse group neon-flicker-blue ${
              darkMode ? 'bg-gray-800 border-gray-700 hover:border-purple-400 hover:shadow-purple-500/50' : 'bg-white hover:border-blue-400 hover:shadow-blue-500/50'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total Departments
                </CardTitle>
                <Users className="w-4 h-4 text-blue-600 group-hover:animate-pulse group-hover:text-blue-400 icon-neon-flicker" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {departmentData.length}
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Active departments
                </p>
              </CardContent>
            </Card>

            <Card className={`transition-all duration-300 hover:shadow-lg hover:animate-pulse group neon-flicker-green ${
              darkMode ? 'bg-gray-800 border-gray-700 hover:border-green-400 hover:shadow-green-500/50' : 'bg-white hover:border-green-400 hover:shadow-green-500/50'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total Completed
                </CardTitle>
                <CheckCircle className="w-4 h-4 text-green-600 group-hover:animate-pulse group-hover:text-green-400 icon-neon-flicker" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {departmentData.reduce((sum, dept) => sum + dept.completedCertifications, 0)}
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Freshers with certifications
                </p>
              </CardContent>
            </Card>

            <Card className={`transition-all duration-300 hover:shadow-lg hover:animate-pulse group neon-flicker-red ${
              darkMode ? 'bg-gray-800 border-gray-700 hover:border-red-400 hover:shadow-red-500/50' : 'bg-white hover:border-red-400 hover:shadow-red-500/50'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Not Completed
                </CardTitle>
                <XCircle className="w-4 h-4 text-red-600 group-hover:animate-pulse group-hover:text-red-400 icon-neon-flicker" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {departmentData.reduce((sum, dept) => sum + dept.notCompletedCertifications, 0)}
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Freshers without certifications
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Department Certification Status */}
          <Card className={`transition-all duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Department Certification Status
              </CardTitle>
              <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Certification completion status for each department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <th className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Department</th>
                      <th className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Freshers</th>
                      <th className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Completed</th>
                      <th className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Not Completed</th>
                      <th className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Completion Rate</th>
                      <th className={`text-left py-4 px-6 font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartments.map((dept, index) => {
                      const completionBadge = getCompletionRateBadge(dept.completionRate);
                      return (
                        <tr key={index} className={`border-b ${darkMode ? 'border-gray-700 hover:bg-gray-700 hover:border-purple-400 hover:shadow-purple-500/20' : 'border-gray-100 hover:bg-gray-50 hover:border-blue-400 hover:shadow-blue-500/20'} transition-all duration-300 hover:animate-pulse`}>
                          <td className={`py-4 px-6 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{dept.department}</td>
                          <td className={`py-4 px-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{dept.totalFreshers}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-green-600 font-semibold">{dept.completedCertifications}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-500" />
                              <span className="text-red-600 font-semibold">{dept.notCompletedCertifications}</span>
                            </div>
                          </td>
                          <td className={`py-4 px-6 font-bold ${getCompletionRateColor(dept.completionRate)}`}>
                            {dept.completionRate}%
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant={completionBadge.variant as any}>
                              {completionBadge.text}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Bubble Chart Component */}
          <div className="mb-8">
            <BubbleChartComponent 
              onExpansionChange={setBubbleChartExpanded}
            />
          </div>

          {/* Department Cards Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ease-in-out ${
            bubbleChartExpanded 
              ? 'opacity-0 max-h-0 overflow-hidden' 
              : 'opacity-100 max-h-none'
          }`}>
            {filteredDepartments.map((dept, index) => (
              <Card key={index} className={`group cursor-pointer transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-2xl hover:-translate-y-2 hover:animate-pulse neon-flicker-purple ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-purple-500/30 hover:shadow-purple-500/50' 
                  : 'bg-white hover:bg-gradient-to-br hover:from-white hover:to-blue-50 hover:border-blue-200 hover:shadow-blue-500/50'
              }`}>
                <CardHeader className="transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-transparent group-hover:to-blue-50/50 dark:group-hover:to-purple-900/20 rounded-t-lg">
                  <CardTitle className={`transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-purple-400 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {dept.department}
                  </CardTitle>
                  <CardDescription className={`transition-all duration-300 group-hover:text-blue-500 dark:group-hover:text-purple-300 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Certification Status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg transition-all duration-300 group-hover:bg-blue-50/50 dark:group-hover:bg-purple-900/20">
                      <span className={`text-sm transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-purple-400 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Total Freshers:
                      </span>
                      <span className={`font-semibold transition-all duration-300 group-hover:text-blue-700 dark:group-hover:text-purple-300 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {dept.totalFreshers}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 rounded-lg transition-all duration-300 group-hover:bg-green-50/50 dark:group-hover:bg-green-900/20">
                      <span className={`text-sm transition-all duration-300 group-hover:text-green-600 dark:group-hover:text-green-400 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Completed:
                      </span>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 transition-all duration-300 group-hover:scale-110 group-hover:text-green-600" />
                        <span className="text-green-600 font-semibold transition-all duration-300 group-hover:text-green-700">
                          {dept.completedCertifications}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 rounded-lg transition-all duration-300 group-hover:bg-red-50/50 dark:group-hover:bg-red-900/20">
                      <span className={`text-sm transition-all duration-300 group-hover:text-red-600 dark:group-hover:text-red-400 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Not Completed:
                      </span>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500 transition-all duration-300 group-hover:scale-110 group-hover:text-red-600" />
                        <span className="text-red-600 font-semibold transition-all duration-300 group-hover:text-red-700">
                          {dept.notCompletedCertifications}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-2 rounded-lg transition-all duration-300 group-hover:bg-yellow-50/50 dark:group-hover:bg-yellow-900/20">
                      <span className={`text-sm transition-all duration-300 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Completion Rate:
                      </span>
                      <span className={`font-bold transition-all duration-300 group-hover:scale-110 ${getCompletionRateColor(dept.completionRate)}`}>
                        {dept.completionRate}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <Badge 
                      variant={getCompletionRateBadge(dept.completionRate).variant as any} 
                      className="w-full justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg"
                    >
                      {getCompletionRateBadge(dept.completionRate).text}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Certifications; 