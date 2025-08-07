import React, { useState, useEffect, useCallback } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useDarkMode } from "@/contexts/DarkModeContext";
import { adminAPI } from '@/services/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface DepartmentData {
  department: string;
  avgScore: number;
  completionRate: number;
  count: number;
  avgQuizScore: number;
  avgCodingScore: number;
  avgAssignmentScore: number;
  avgCertificationScore: number;
}

const RadarChartComponent: React.FC = () => {
  const { darkMode } = useDarkMode();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchDepartmentData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching department data for radar chart...');
      const response = await adminAPI.getDepartmentAnalytics();
      console.log('📊 API Response:', response);
      
      if (response.success && response.data) {
        console.log('✅ Setting radar chart data:', response.data);
        setData(response.data);
        setLastUpdate(new Date());
        
        // Initialize selected departments as empty (0 departments selected initially)
        // Removed automatic selection of all departments
      } else {
        console.error('❌ API returned error:', response);
        setError('Failed to fetch department data');
      }
    } catch (err) {
      console.error('❌ Error fetching department data:', err);
      setError('Error loading department data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartmentData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing radar chart data...');
      fetchDepartmentData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchDepartmentData]);

  // Transform data for radar chart
  const transformDataForRadar = (departmentData: DepartmentData[]) => {
    if (!departmentData || departmentData.length === 0) return [];

    const radarData = [
      {
        subject: 'Performance',
        ...departmentData.reduce((acc, dept) => {
          acc[dept.department] = dept.avgScore;
          return acc;
        }, {} as any)
      },
      {
        subject: 'Completion',
        ...departmentData.reduce((acc, dept) => {
          acc[dept.department] = dept.completionRate;
          return acc;
        }, {} as any)
      },
      {
        subject: 'Headcount',
        ...departmentData.reduce((acc, dept) => {
          // Normalize headcount to 0-100 scale
          const maxCount = Math.max(...departmentData.map(d => d.count));
          acc[dept.department] = (dept.count / maxCount) * 100;
          return acc;
        }, {} as any)
      },
      {
        subject: 'Efficiency',
        ...departmentData.reduce((acc, dept) => {
          // Calculate efficiency as average of quiz and coding scores
          acc[dept.department] = Math.round((dept.avgQuizScore + dept.avgCodingScore) / 2);
          return acc;
        }, {} as any)
      },
      {
        subject: 'Growth',
        ...departmentData.reduce((acc, dept) => {
          // Calculate growth as average of assignment and certification scores
          acc[dept.department] = Math.round((dept.avgAssignmentScore + dept.avgCertificationScore) / 2);
          return acc;
        }, {} as any)
      },
    ];

    return radarData;
  };

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    fetchDepartmentData();
  };

  const handleDepartmentSelect = (department: string) => {
    if (!selectedDepartments.includes(department)) {
      setSelectedDepartments(prev => [...prev, department]);
    }
  };

  const removeDepartment = (department: string) => {
    setSelectedDepartments(prev => prev.filter(d => d !== department));
  };

  const selectAllDepartments = () => {
    setSelectedDepartments(data.map(dept => dept.department));
  };

  const clearAllDepartments = () => {
    setSelectedDepartments([]);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 border rounded-lg shadow-lg ${
          darkMode 
            ? 'bg-gray-800 border-gray-600 text-gray-200' 
            : 'bg-white border-gray-200 text-gray-800'
        }`}>
          <p className="font-medium">{`Dimension: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const radarData = transformDataForRadar(data);
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00c49f', '#0088fe', '#ff8042', '#a4de6c'];

  if (loading) {
    return (
      <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Multi-dimensional Analysis</h3>
          <button
            onClick={handleRefresh}
            className={`px-3 py-1 text-xs rounded-md ${
              darkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🔄 Refresh
          </button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading department data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Multi-dimensional Analysis</h3>
          <button
            onClick={handleRefresh}
            className={`px-3 py-1 text-xs rounded-md ${
              darkMode 
                ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            🔄 Retry
          </button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Multi-dimensional Analysis</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Department performance across multiple dimensions
            <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <button
          onClick={handleRefresh}
          className={`px-3 py-1 text-xs rounded-md ${
            darkMode 
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Department Selection Controls */}
      <div className="mb-6 space-y-4">
        {/* Multi-select Dropdown */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Departments
            </label>
            <Select onValueChange={handleDepartmentSelect}>
              <SelectTrigger className={`${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300'}`}>
                <SelectValue placeholder="Choose departments to display..." />
              </SelectTrigger>
              <SelectContent className={darkMode ? 'bg-gray-700 border-gray-600' : ''}>
                {data.map((dept) => (
                  <SelectItem 
                    key={dept.department} 
                    value={dept.department}
                    className={darkMode ? 'text-gray-200 hover:bg-gray-600' : ''}
                  >
                    {dept.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              onClick={selectAllDepartments}
              className={`px-3 py-2 text-xs rounded-md ${
                darkMode 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              Select All
            </button>
            <button
              onClick={clearAllDepartments}
              className={`px-3 py-2 text-xs rounded-md ${
                darkMode 
                  ? 'bg-red-600 text-white hover:bg-red-700' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Selected Departments Display */}
        {selectedDepartments.length > 0 && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Selected Departments ({selectedDepartments.length})
            </label>
            <div className="flex flex-wrap gap-2">
              {selectedDepartments.map((dept, index) => (
                <Badge
                  key={dept}
                  variant="secondary"
                  className="flex items-center gap-1"
                  style={{ 
                    backgroundColor: colors[index % colors.length] + '20',
                    color: colors[index % colors.length],
                    borderColor: colors[index % colors.length]
                  }}
                >
                  {dept}
                  <button
                    onClick={() => removeDepartment(dept)}
                    className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {selectedDepartments.length === 0 && (
          <div className={`text-center py-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            No departments selected. Please select departments to view the chart.
          </div>
        )}
      </div>

      {/* Radar Chart */}
      {selectedDepartments.length > 0 && (
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <PolarAngleAxis dataKey="subject" tick={{ fill: darkMode ? '#d1d5db' : '#374151' }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: darkMode ? '#d1d5db' : '#374151' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {data.map((dept, index) => (
              selectedDepartments.includes(dept.department) && (
                <Radar 
                  key={dept.department}
                  name={dept.department} 
                  dataKey={dept.department} 
                  stroke={colors[index % colors.length]} 
                  fill={colors[index % colors.length]} 
                  fillOpacity={0.3} 
                />
              )
            ))}
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default RadarChartComponent; 