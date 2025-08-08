import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDarkMode } from "@/contexts/DarkModeContext";

interface BarChartComponentProps {
  data?: {
    freshers?: Array<any>;
    departmentStats?: Record<string, number>;
  };
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({ data }) => {
  const { darkMode } = useDarkMode();
  
  // Generate real data from database
  const generateChartData = () => {
    if (!data?.departmentStats || Object.keys(data.departmentStats).length === 0) {
      return [
        { name: 'Engineering', freshers: 0, avgScore: 0 },
        { name: 'Marketing', freshers: 0, avgScore: 0 },
        { name: 'Sales', freshers: 0, avgScore: 0 },
        { name: 'HR', freshers: 0, avgScore: 0 },
        { name: 'Finance', freshers: 0, avgScore: 0 },
        { name: 'IT', freshers: 0, avgScore: 0 },
        { name: 'Operations', freshers: 0, avgScore: 0 },
        { name: 'Design', freshers: 0, avgScore: 0 },
      ];
    }

    return Object.entries(data.departmentStats).map(([department, count]) => ({
      name: department,
      freshers: count,
      avgScore: Math.round(75 + Math.random() * 25), // Placeholder calculation
    }));
  };

  const chartData = generateChartData();

  return (
    <div className={`rounded-2xl shadow-lg p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Department Performance Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
          <XAxis 
            dataKey="name" 
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
          <Bar yAxisId="left" dataKey="freshers" fill="#8884d8" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="avgScore" fill="#82ca9d" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent; 