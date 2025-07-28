import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Sidebar from "@/components/Sidebar";
import {
  Users,
  BookOpen,
  Award,
  FileText,
  Bell,
  UserPlus,
  User,
  Search,
  Download,
  TrendingUp,
  BarChart3,
  Activity,
  Brain,
  Monitor,
  CheckCircle,
  Plus,
  Eye,
  ChevronDown,
  Settings
} from "lucide-react";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [reportFilter, setReportFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Icon mapping for dynamic icons
  const iconMap: { [key: string]: any } = {
    Users,
    BookOpen,
    Award,
    FileText
  };

  // Filter functions
  const getFilteredFreshers = () => {
    if (!dashboardData?.freshersData) return [];
    
    let filtered = dashboardData.freshersData;
    
    // Filter by department
    if (departmentFilter !== 'all') {
      filtered = filtered.filter((fresher: any) => 
        fresher.department.toLowerCase().includes(departmentFilter.toLowerCase())
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((fresher: any) => 
        fresher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fresher.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fresher.skills.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Get unique departments from data
  const getUniqueDepartments = () => {
    if (!dashboardData?.freshersData) return [];
    
    const departments = dashboardData.freshersData.map((fresher: any) => fresher.department);
    return [...new Set(departments)].sort();
  };

  // Get department statistics
  const getDepartmentStats = () => {
    if (!dashboardData?.freshersData) return {};
    
    const stats: { [key: string]: number } = {};
    dashboardData.freshersData.forEach((fresher: any) => {
      const dept = fresher.department;
      stats[dept] = (stats[dept] || 0) + 1;
    });
    
    return stats;
  };

  const getFilteredAgentMetrics = () => {
    if (!dashboardData?.agentMetrics) return [];
    
    if (agentFilter === 'all') return dashboardData.agentMetrics;
    
    return dashboardData.agentMetrics.filter((metric: any) => 
      metric.name.toLowerCase().includes(agentFilter.toLowerCase())
    );
  };

  const getFilteredReportMetrics = () => {
    if (!dashboardData?.reportMetrics) return [];
    
    if (reportFilter === 'all') return dashboardData.reportMetrics;
    
    return dashboardData.reportMetrics.filter((metric: any) => 
      metric.name.toLowerCase().includes(reportFilter.toLowerCase())
    );
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
    setLoading(true);
        const response = await fetch('http://localhost:5000/api/admin/dashboard');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">{error}</div>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-lg">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm">
                <UserPlus className="w-5 h-5" />
            </Button>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dashboardData?.summaryCards?.map((card, index) => {
              const IconComponent = iconMap[card.icon];
              return (
                <Card key={index} className="bg-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-100">{card.title}</p>
                        <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                        <div className="w-full bg-gray-300 rounded-full h-1 mt-3">
                          <div className="bg-white h-1 rounded-full" style={{ width: `${Math.random() * 40 + 60}%` }}></div>
                        </div>
                      </div>
                      {IconComponent && <IconComponent className="w-8 h-8 text-blue-200" />}
                </div>
              </CardContent>
            </Card>
              );
            })}
        </div>

          {/* Analytics Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            
            {/* First Row - Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Department Overview */}
              <Card className="bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Department Overview</CardTitle>
                      <p className="text-sm text-gray-600">Fresher Distribution</p>
                      <p className="text-xs text-gray-500">{getUniqueDepartments().length} Departments</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue-600 bg-blue-50"
                      onClick={() => setDepartmentFilter('all')}
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getUniqueDepartments().slice(0, 3).map((dept: string) => {
                      const stats = getDepartmentStats();
                      const count = stats[dept] || 0;
                      const percentage = dashboardData?.freshersData ? Math.round((count / dashboardData.freshersData.length) * 100) : 0;
                      return (
                        <div key={dept} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{dept}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{count}</span>
                            <span className="text-xs text-gray-500">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                    {getUniqueDepartments().length > 3 && (
                      <div className="text-xs text-gray-500 text-center pt-2">
                        +{getUniqueDepartments().length - 3} more departments
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Certification % */}
              <Card className="bg-white">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">Certification</CardTitle>
                      <p className="text-sm text-gray-600">Certification %</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-gray-600">Active</Button>
                      <Button variant="outline" size="sm" className="text-gray-600">Pending</Button>
                      <Button variant="outline" size="sm" className="text-gray-600">Compleod</Button>
                    </div>
                    <div className="w-16 h-16 relative">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#E5E7EB"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#3B82F6"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * 0.3}`}
                          strokeLinecap="round"
                        />
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          stroke="#F59E0B"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 28}`}
                          strokeDashoffset={`${2 * Math.PI * 28 * 0.1}`}
                          strokeLinecap="round"
                        />
                      </svg>
                  </div>
                </div>
                </CardContent>
              </Card>

              {/* Filter */}
              <Card className="bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Filterch & Filter</CardTitle>
                  <CardDescription className="text-sm text-gray-600">Dntrier by</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="Search freshers..." 
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
                          </div>

            
                          </div>

          {/* Charts and Agent Monitoring */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Assessment Performance */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Assessment performance by department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 relative">
                  {/* Y-axis */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
                    <span>200</span>
                    <span>100</span>
                    <span>0</span>
                        </div>
                  
                  {/* Chart area */}
                  <div className="ml-8 h-full flex items-end justify-between gap-2">
                    {[60, 120, 180, 90, 150, 80, 160].map((height, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="bg-blue-500 rounded-t w-full"
                          style={{ height: `${(height / 200) * 100}%` }}
                        ></div>
                        <div className="text-xs text-gray-500 mt-1">10</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Line overlay */}
                  <svg className="absolute inset-0 ml-8" style={{ pointerEvents: 'none' }}>
                    <polyline
                      points="0,80 50,40 100,20 150,60 200,30 250,50 300,20"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Participation */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Quiz Participation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 relative">
                  {/* Y-axis */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
                    <span>90</span>
                    <span>44</span>
                    <span>21</span>
                    <span>0</span>
                  </div>
                  
                  {/* Chart area */}
                  <div className="ml-8 h-full relative">
                    <svg className="w-full h-full" style={{ pointerEvents: 'none' }}>
                      {/* Area fill */}
                      <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1"/>
                        </linearGradient>
                      </defs>
                      
                      {/* Area chart */}
                      <path
                        d="M0,60 L50,40 L100,30 L150,20 L200,25 L250,35 L300,45 L350,50"
                        fill="url(#areaGradient)"
                        stroke="none"
                      />
                      
                      {/* Line */}
                      <polyline
                        points="0,60 50,40 100,30 150,20 200,25 250,35 300,45 350,50"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2"
                      />
                    </svg>
                    
                    {/* X-axis labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
                      <span>1</span>
                      <span>5</span>
                      <span>7</span>
                      <span>20</span>
                      <span>15</span>
                      <span>15</span>
                      <span>20</span>
                    </div>
          </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Guan 60%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Den 021%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Agent Monitoring */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Agent Monitoring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    <SelectItem value="active">Active/Idle</SelectItem>
                    <SelectItem value="profile">Profile Management Agent</SelectItem>
                    <SelectItem value="mentris">Mentris</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="space-y-3">
                  {getFilteredAgentMetrics().map((metric, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{metric.name}</span>
                      <span className="text-sm font-medium">{metric.value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 text-sm">
                    Export to Pb/Excel
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-sm">
                    Export to PDF/Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row - Fresher Details and Report Generator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fresher Details */}
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Fresher Details</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Showing {getFilteredFreshers().length} of {dashboardData?.freshersData?.length || 0} freshers
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {getUniqueDepartments().map((dept: string) => {
                          const stats = getDepartmentStats();
                          const count = stats[dept] || 0;
                          return (
                            <SelectItem key={dept} value={dept.toLowerCase()}>
                              {dept} ({count})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {(departmentFilter !== 'all' || searchQuery) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setDepartmentFilter('all');
                          setSearchQuery('');
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Department</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Skills</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Quizzes</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Coding %</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Assignments</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Certifications</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredFreshers().map((fresher, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium">{fresher.name}</td>
                          <td className="py-3 px-4 text-gray-600">{fresher.department}</td>
                          <td className="py-3 px-4 text-gray-600">{fresher.skills}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">{fresher.quizzes}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm">{fresher.coding}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="text-sm">{fresher.assignments}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Award className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm">{fresher.certifications}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Report Generator */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Report Generator</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={reportFilter} onValueChange={setReportFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reports</SelectItem>
                    <SelectItem value="active">Active Rale</SelectItem>
                    <SelectItem value="processing">Processing Agent</SelectItem>
                    <SelectItem value="queue">Processing Queue</SelectItem>
                    <SelectItem value="reporting">Reporting Agent</SelectItem>
                    <SelectItem value="latertina">Latertina Agent</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="space-y-3">
                  {getFilteredReportMetrics().map((metric, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{metric.name}</span>
                      <span className="text-sm font-medium">{metric.value}</span>
                    </div>
                  ))}
                </div>
                
                {/* Small bar chart */}
                <div className="h-16 bg-gray-50 rounded-lg p-2">
                  <div className="flex items-end justify-between h-full gap-1">
                    {[20, 45, 30, 60, 25, 40, 35, 50, 15, 55, 30, 40].map((height, index) => (
                      <div 
                        key={index} 
                        className="bg-blue-500 rounded-t flex-1"
                        style={{ height: `${height}%` }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span key={i}>0</span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
