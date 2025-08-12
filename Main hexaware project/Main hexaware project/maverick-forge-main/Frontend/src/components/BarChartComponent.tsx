import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDarkMode } from "@/contexts/DarkModeContext";
import { adminAPI } from '@/services/api';

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

const BarChartComponent: React.FC = () => {
  const { darkMode } = useDarkMode();
  const [data, setData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchDepartmentData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDepartmentAnalytics();
      
      if (response.success && response.data) {
        setData(response.data);
        setLastUpdate(new Date());
        setError(null);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch department data. Showing sample data.');
      setData([
        { department: 'Software Engineering', avgScore: 85, completionRate: 88, count: 5, avgQuizScore: 85, avgCodingScore: 90, avgAssignmentScore: 82, avgCertificationScore: 85 },
        { department: 'Data Science', avgScore: 92, completionRate: 95, count: 3, avgQuizScore: 92, avgCodingScore: 88, avgAssignmentScore: 95, avgCertificationScore: 87 },
        { department: 'DevOps', avgScore: 78, completionRate: 82, count: 2, avgQuizScore: 78, avgCodingScore: 85, avgAssignmentScore: 82, avgCertificationScore: 80 },
        { department: 'Marketing', avgScore: 88, completionRate: 91, count: 2, avgQuizScore: 88, avgCodingScore: 75, avgAssignmentScore: 90, avgCertificationScore: 85 },
        { department: 'Sales', avgScore: 82, completionRate: 88, count: 1, avgQuizScore: 82, avgCodingScore: 70, avgAssignmentScore: 85, avgCertificationScore: 88 },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartmentData();
    const interval = setInterval(fetchDepartmentData, 30000);
    return () => clearInterval(interval);
  }, [fetchDepartmentData]);

  const handleRefresh = () => {
    fetchDepartmentData();
  };

  if (loading) {
    return (
      <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Domain Performance Overview</h3>
          <button onClick={handleRefresh} className={`px-3 py-1 text-xs rounded-md ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>🔄 Refresh</button>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Domain Performance Overview</h3>
          <button onClick={handleRefresh} className={`px-3 py-1 text-xs rounded-md ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>🔄 Refresh</button>
        </div>
        <div className="h-64 flex items-center justify-center">
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Domain Performance Overview</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <button onClick={handleRefresh} className={`px-3 py-1 text-xs rounded-md ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>🔄 Refresh</button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
          <XAxis 
            dataKey="department" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
            tick={{ fill: darkMode ? '#d1d5db' : '#374151' }}
          />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tick={{ fill: darkMode ? '#d1d5db' : '#374151' }} />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fill: darkMode ? '#d1d5db' : '#374151' }} />
          <Tooltip 
            contentStyle={{
              backgroundColor: darkMode ? '#1f2937' : 'white',
              border: darkMode ? '1px solid #374151' : '1px solid #ccc',
              borderRadius: '8px',
              color: darkMode ? '#d1d5db' : '#374151',
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="count" name="Freshers Count" fill="#8884d8" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="avgScore" name="Average Score" fill="#82ca9d" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent; 