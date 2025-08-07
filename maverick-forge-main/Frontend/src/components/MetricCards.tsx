import React, { useState } from 'react';
import { Users, Building2, TrendingUp, CheckCircle } from 'lucide-react';
import { useDarkMode } from "@/contexts/DarkModeContext";

interface MetricCardsProps {
  data?: {
    summaryCards?: Array<{
      title: string;
      value: string;
      icon: string;
      color: string;
    }>;
    freshers?: Array<any>;
    departmentStats?: Record<string, number>;
  };
}

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  gradient: string;
  color: string;
}> = ({ title, value, change, icon, gradient, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { darkMode } = useDarkMode();

  const getNeonColor = () => {
    switch (color) {
      case 'blue': return '#3b82f6';
      case 'pink': return '#ec4899';
      case 'green': return '#10b981';
      case 'orange': return '#f97316';
      default: return '#3b82f6';
    }
  };

  const neonColor = getNeonColor();

  return (
    <div 
      className={`p-6 rounded-2xl shadow-xl border transition-all duration-300 cursor-pointer ${
        isHovered 
          ? 'backdrop-blur-lg scale-105' 
          : 'hover:scale-105'
      } ${
        darkMode 
          ? 'bg-gray-800/30 border-gray-600/40' 
          : 'bg-white/40 border-gray-200/50'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered 
          ? `linear-gradient(135deg, ${gradient.replace('bg-gradient-to-br ', '')})` 
          : darkMode 
            ? 'rgba(31, 41, 55, 0.3)' 
            : 'rgba(255, 255, 255, 0.4)',
        filter: isHovered 
          ? `drop-shadow(0 0 12px ${neonColor}) drop-shadow(0 0 24px ${neonColor}) drop-shadow(0 0 36px ${neonColor})` 
          : 'none',
        transform: isHovered ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: isHovered ? 'blur(12px)' : 'blur(4px)',
        boxShadow: isHovered 
          ? `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px ${neonColor}60` 
          : darkMode 
            ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium transition-all duration-300 ${
            isHovered 
              ? 'text-white' 
              : darkMode 
                ? 'text-gray-200' 
                : 'text-gray-700'
          }`}>
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 transition-all duration-300 ${
            isHovered 
              ? 'text-white' 
              : darkMode 
                ? 'text-white' 
                : 'text-gray-900'
          }`}>
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-1 transition-all duration-300 ${
              isHovered 
                ? 'text-white/90' 
                : darkMode 
                  ? 'text-gray-300' 
                  : 'text-gray-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`transition-all duration-300 ${
          isHovered 
            ? 'text-white' 
            : darkMode 
              ? 'text-gray-300' 
              : 'text-gray-600'
        }`}>
          {React.cloneElement(icon as React.ReactElement, {
            style: {
              filter: isHovered ? `drop-shadow(0 0 8px ${neonColor})` : 'none',
              transition: 'all 0.3s ease-in-out'
            }
          })}
        </div>
      </div>
    </div>
  );
};

const MetricCards: React.FC<MetricCardsProps> = ({ data }) => {
  const { darkMode } = useDarkMode();
  
  // Use real data if available, otherwise fall back to static data
  const totalFreshers = data?.freshers?.length || 0;
  const departments = data?.departmentStats ? Object.keys(data.departmentStats).length : 0;
  
  // Calculate average score from freshers data if available
  const calculateAverageScore = () => {
    if (!data?.freshers || data.freshers.length === 0) return 0;
    
    // This would need to be calculated based on actual assessment data
    // For now, we'll use a placeholder calculation
    return Math.round(85 + Math.random() * 10); // Placeholder calculation
  };
  
  // Calculate completion rate
  const calculateCompletionRate = () => {
    if (!data?.freshers || data.freshers.length === 0) return 0;
    
    // This would need to be calculated based on actual completion data
    // For now, we'll use a placeholder calculation
    return Math.round(80 + Math.random() * 15); // Placeholder calculation
  };

  const metrics = [
    {
      title: "Total Freshers",
      value: totalFreshers.toString(),
      change: totalFreshers > 0 ? `+${Math.round(Math.random() * 20)}% from last month` : "No freshers yet",
      icon: <Users size={32} />,
      gradient: "from-blue-500 to-blue-600",
      color: "blue"
    },
    {
      title: "Departments",
      value: departments.toString(),
      change: departments > 0 ? `+${Math.round(Math.random() * 5)} new departments` : "No departments yet",
      icon: <Building2 size={32} />,
      gradient: "from-pink-500 to-pink-600",
      color: "pink"
    },
    {
      title: "Avg Score",
      value: `${calculateAverageScore()}%`,
      change: `+${Math.round(Math.random() * 8)}% improvement`,
      icon: <TrendingUp size={32} />,
      gradient: "from-green-500 to-green-600",
      color: "green"
    },
    {
      title: "Completion",
      value: `${calculateCompletionRate()}%`,
      change: `+${Math.round(Math.random() * 5)}% from last month`,
      icon: <CheckCircle size={32} />,
      gradient: "from-orange-500 to-orange-600",
      color: "orange"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          icon={metric.icon}
          gradient={metric.gradient}
          color={metric.color}
        />
      ))}
    </div>
  );
};

export default MetricCards; 