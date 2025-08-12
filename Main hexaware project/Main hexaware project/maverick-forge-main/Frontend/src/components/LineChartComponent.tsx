import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { useDarkMode } from "@/contexts/DarkModeContext";
import { adminAPI } from '@/services/api';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

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

const LineChartComponent: React.FC = () => {
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

  const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const departmentData = data.find(d => d.department === label);
      return (
        <div className={`p-3 border rounded-lg shadow-lg ${darkMode ? 'bg-gray-800 border-gray-600 text-gray-200' : 'bg-white border-gray-200 text-gray-800'}`}>
          <p className="font-medium">{`Domain: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color || 'inherit' }}>
              {`${entry.name}: ${entry.value}%`}
            </p>
          ))}
          {departmentData && (
            <div className="border-t border-gray-300 mt-2 pt-2">
              <p className="text-xs text-gray-500">{`Total Freshers: ${departmentData.count}`}</p>
              <p className="text-xs text-gray-500">{`Completion Rate: ${departmentData.completionRate}%`}</p>
              <p className="text-xs text-gray-500">{`Assignments: ${departmentData.avgAssignmentScore}% | Certifications: ${departmentData.avgCertificationScore}%`}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <ChartCard title="Average Score Performance Trends" subtitle="Domain-wise average scores" onRefresh={handleRefresh} darkMode={darkMode}>Loading...</ChartCard>;
  }

  if (error) {
    return <ChartCard title="Average Score Performance Trends" subtitle="Domain-wise average scores" onRefresh={handleRefresh} darkMode={darkMode}>{error}</ChartCard>;
  }

  return (
    <ChartCard 
      title="Average Score Performance Trends" 
      subtitle={`Domain-wise average scores across different assessment types | Last updated: ${lastUpdate.toLocaleTimeString()}`} 
      onRefresh={handleRefresh} 
      darkMode={darkMode}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
          <XAxis dataKey="department" tick={{ fill: darkMode ? '#d1d5db' : '#374151' }} angle={-45} textAnchor="end" interval={0} height={80} fontSize={12} />
          <YAxis tick={{ fill: darkMode ? '#d1d5db' : '#374151' }} domain={[0, 100]} label={{ value: 'Average Score (%)', angle: -90, position: 'insideLeft', fill: darkMode ? '#d1d5db' : '#374151' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="monotone" dataKey="avgScore" name="Average Score" stroke="#ff8c00" strokeWidth={3} dot={{ fill: '#ff8c00', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="avgQuizScore" name="Quiz Score" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', strokeWidth: 1, r: 3 }} activeDot={{ r: 5 }} strokeDasharray="5 5" />
          <Line type="monotone" dataKey="avgCodingScore" name="Coding Score" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 1, r: 3 }} activeDot={{ r: 5 }} strokeDasharray="3 3" />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

const ChartCard: React.FC<{ title: string; subtitle: string; onRefresh: () => void; darkMode: boolean; children: React.ReactNode }> = ({ title, subtitle, onRefresh, darkMode, children }) => (
  <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{subtitle}</p>
      </div>
      <button onClick={onRefresh} className={`px-3 py-1 text-xs rounded-md ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>🔄 Refresh</button>
    </div>
    <div className="h-64 flex items-center justify-center">{children}</div>
  </div>
);

export default LineChartComponent;
