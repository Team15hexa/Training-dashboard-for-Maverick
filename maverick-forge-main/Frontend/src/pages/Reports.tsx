import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { useDarkMode } from "@/contexts/DarkModeContext";
import {
  FileText,
  Download,
  TrendingUp,
  Calendar,
  Users,
  BarChart3
} from "lucide-react";

const Reports = () => {
  const { darkMode, toggleDarkMode, isTransitioning } = useDarkMode();
  const { toast } = useToast();

  const mockReports = [
    {
      id: 1,
      title: "Monthly Training Report",
      description: "Comprehensive overview of training activities and performance metrics",
      type: "Monthly",
      status: "Generated",
      date: "2024-01-15",
      size: "2.3 MB"
    },
    {
      id: 2,
      title: "Department Performance Analysis",
      description: "Detailed analysis of performance across different departments",
      type: "Analytics",
      status: "Pending",
      date: "2024-01-14",
      size: "1.8 MB"
    },
    {
      id: 3,
      title: "Fresher Progress Report",
      description: "Individual progress tracking for all freshers",
      type: "Progress",
      status: "Generated",
      date: "2024-01-13",
      size: "3.1 MB"
    },
    {
      id: 4,
      title: "Assessment Results Summary",
      description: "Summary of all assessment results and scores",
      type: "Assessment",
      status: "Generated",
      date: "2024-01-12",
      size: "1.5 MB"
    }
  ];

  const handleDownloadReport = (report: any) => {
    toast({
      title: "Download Started",
      description: `Downloading ${report.title}...`,
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Report Generation",
      description: "New report generation started. You'll be notified when ready.",
    });
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'}`}>
      <Sidebar darkMode={darkMode} />
      
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className={`p-6 border-b transition-all duration-300 backdrop-blur-sm ${
          darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Reports
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Generate and manage training reports and analytics.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleGenerateReport}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Generate Report
              </Button>
              

            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className={`transition-all duration-300 hover:shadow-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total Reports
                </CardTitle>
                <FileText className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {mockReports.length}
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Available reports
                </p>
              </CardContent>
            </Card>

            <Card className={`transition-all duration-300 hover:shadow-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Generated
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {mockReports.filter(r => r.status === 'Generated').length}
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Ready for download
                </p>
              </CardContent>
            </Card>

            <Card className={`transition-all duration-300 hover:shadow-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Pending
                </CardTitle>
                <Calendar className="w-4 h-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {mockReports.filter(r => r.status === 'Pending').length}
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  In progress
                </p>
              </CardContent>
            </Card>

            <Card className={`transition-all duration-300 hover:shadow-lg ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
            }`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total Size
                </CardTitle>
                <BarChart3 className="w-4 h-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  8.7 MB
                </div>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Combined size
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reports List */}
          <Card className={`transition-all duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Available Reports
              </CardTitle>
              <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Download and manage your training reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockReports.map((report) => (
                  <div key={report.id} className={`flex items-center justify-between p-4 rounded-lg border ${
                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className={`w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {report.title}
                        </h3>
                        <Badge variant={report.status === 'Generated' ? 'default' : 'secondary'}>
                          {report.status}
                        </Badge>
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {report.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Type: {report.type}
                        </span>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Date: {report.date}
                        </span>
                        <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          Size: {report.size}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {report.status === 'Generated' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report)}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      )}
                      {report.status === 'Pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="flex items-center gap-2"
                        >
                          <Calendar className="w-4 h-4" />
                          Pending
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className={`transition-all duration-300 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'
          }`}>
            <CardHeader>
              <CardTitle className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </CardTitle>
              <CardDescription className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Generate common reports quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4"
                  onClick={() => toast({ title: "Monthly Report", description: "Generating monthly report..." })}
                >
                  <Calendar className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Monthly Report</div>
                    <div className="text-xs text-gray-500">Generate monthly summary</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4"
                  onClick={() => toast({ title: "Performance Report", description: "Generating performance report..." })}
                >
                  <BarChart3 className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">Performance Report</div>
                    <div className="text-xs text-gray-500">Analyze performance metrics</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center gap-2 h-auto p-4"
                  onClick={() => toast({ title: "User Report", description: "Generating user report..." })}
                >
                  <Users className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-semibold">User Report</div>
                    <div className="text-xs text-gray-500">User activity and progress</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Reports; 