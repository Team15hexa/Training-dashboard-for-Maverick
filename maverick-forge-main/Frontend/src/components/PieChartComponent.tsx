import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useDarkMode } from "@/contexts/DarkModeContext";

interface PieChartComponentProps {
  data?: {
    departmentStats?: Record<string, number>;
  };
}

const PieChartComponent: React.FC<PieChartComponentProps> = ({ data }) => {
  const { darkMode } = useDarkMode();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Generate real data from database
  const generateChartData = () => {
    if (!data?.departmentStats || Object.keys(data.departmentStats).length === 0) {
      return [
        { name: 'Engineering', value: 0, color: '#8884d8' },
        { name: 'Marketing', value: 0, color: '#82ca9d' },
        { name: 'Sales', value: 0, color: '#ffc658' },
        { name: 'HR', value: 0, color: '#ff7300' },
        { name: 'Finance', value: 0, color: '#00c49f' },
        { name: 'IT', value: 0, color: '#0088fe' },
        { name: 'Operations', value: 0, color: '#ff8042' },
        { name: 'Design', value: 0, color: '#a4de6c' },
      ];
    }

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00c49f', '#0088fe', '#ff8042', '#a4de6c'];
    
    return Object.entries(data.departmentStats).map(([department, count], index) => ({
      name: department,
      value: count,
      color: colors[index % colors.length]
    }));
  };

  const chartData = generateChartData();
  const COLORS = chartData.map(item => item.color);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 border rounded-lg shadow-lg ${
          darkMode 
            ? 'bg-gray-800/90 border-gray-600/50 text-gray-200' 
            : 'bg-white/90 border-gray-200/50 text-gray-800'
        }`}>
          <p className="font-medium text-lg">{`${payload[0].name}`}</p>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{`Freshers: ${payload[0].value}`}</p>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{`Percentage: ${((payload[0].value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
  };

  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className={`rounded-2xl shadow-xl p-6 border ${
      darkMode 
        ? 'bg-gray-800/20 border-gray-600/20' 
        : 'bg-white/20 border-gray-200/20'
    }`}>
      <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Department Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={null}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                style={{
                  filter: hoveredIndex === index 
                    ? `drop-shadow(0 0 8px ${COLORS[index % COLORS.length]}) 
                       drop-shadow(0 0 16px ${COLORS[index % COLORS.length]}) 
                       drop-shadow(0 0 24px ${COLORS[index % COLORS.length]})` 
                    : 'none',
                  transition: 'all 0.3s ease-in-out',
                  transform: hoveredIndex === index ? 'scale(1.1)' : 'scale(1)',
                  opacity: hoveredIndex === index ? 0.9 : 1
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '12px'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChartComponent; 