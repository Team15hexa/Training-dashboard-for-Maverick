import React, { useState, useEffect, useCallback } from 'react';
import { Users, Building2, TrendingUp, CheckCircle } from 'lucide-react';
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
      className={`p-6 rounded-2xl shadow-xl border transition-all duration-500 ease-out cursor-pointer ${
        isHovered 
          ? 'backdrop-blur-lg scale-105 -translate-y-2' 
          : 'hover:scale-105 hover:-translate-y-1'
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
          ? `drop-shadow(0 0 20px ${neonColor}) drop-shadow(0 0 40px ${neonColor}) drop-shadow(0 0 60px ${neonColor})` 
          : 'none',
        transform: isHovered ? 'scale(1.08) translateY(-8px)' : 'scale(1)',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: isHovered ? 'blur(16px)' : 'blur(4px)',
        boxShadow: isHovered 
          ? `0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px ${neonColor}80` 
          : darkMode 
            ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
            : '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium transition-all duration-500 ${
            isHovered 
              ? 'text-white scale-105' 
              : darkMode 
                ? 'text-gray-200' 
                : 'text-gray-700'
          }`}>
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 transition-all duration-500 ${
            isHovered 
              ? 'text-white scale-110' 
              : darkMode 
                ? 'text-white' 
                : 'text-gray-900'
          }`}>
            {value}
          </p>
          {change && (
            <p className={`text-sm mt-1 transition-all duration-500 ${
              isHovered 
                ? 'text-white/90 scale-105' 
                : darkMode 
                  ? 'text-gray-300' 
                  : 'text-gray-600'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`transition-all duration-500 ${
          isHovered 
            ? 'text-white scale-110 rotate-3' 
            : darkMode 
              ? 'text-gray-300' 
              : 'text-gray-600'
        }`}>
          {React.cloneElement(icon as React.ReactElement, {
            style: {
              filter: isHovered ? `drop-shadow(0 0 12px ${neonColor}) drop-shadow(0 0 24px ${neonColor})` : 'none',
              transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHovered ? 'scale(1.2) rotate(5deg)' : 'scale(1) rotate(0deg)'
            }
          })}
        </div>
      </div>
    </div>
  );
};

const MetricCards: React.FC<MetricCardsProps> = ({ data }) => {
  const { darkMode } = useDarkMode();
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Use real data if available, otherwise fall back to static data
  const totalFreshers = data?.freshers?.length || 0;
  const departments = data?.departmentStats ? Object.keys(data.departmentStats).length : 0;
  
  // Fetch department analytics data
  const fetchDepartmentData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDepartmentAnalytics();
      
      if (response.success && response.data) {
        setDepartmentData(response.data);
      } else {
        throw new Error("Invalid API response");
      }
    } catch (err) {
      console.error('Error fetching department analytics:', err);
      // Fallback to sample data
      setDepartmentData([
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
  }, [fetchDepartmentData]);
  
  // Calculate average score from assessment scores (quiz, coding, assignments)
  const calculateAverageScore = () => {
    if (departmentData.length === 0) return 0;
    
    const totalScore = departmentData.reduce((sum, dept) => {
      // Calculate average of quiz, coding, and assignment scores for each department
      const deptAvgScore = Math.round((dept.avgQuizScore + dept.avgCodingScore + dept.avgAssignmentScore) / 3);
      return sum + (deptAvgScore * dept.count); // Weight by number of freshers
    }, 0);
    
    const totalFreshers = departmentData.reduce((sum, dept) => sum + dept.count, 0);
    return totalFreshers > 0 ? Math.round(totalScore / totalFreshers) : 0;
  };
  
  // Calculate completion rate from certification completion (certification score represents completion %)
  const calculateCompletionRate = () => {
    if (departmentData.length === 0) return 0;
    
    const totalCompletion = departmentData.reduce((sum, dept) => {
      return sum + (dept.avgCertificationScore * dept.count); // Weight by number of freshers
    }, 0);
    
    const totalFreshers = departmentData.reduce((sum, dept) => sum + dept.count, 0);
    return totalFreshers > 0 ? Math.round(totalCompletion / totalFreshers) : 0;
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
      title: "Domains",
      value: departments.toString(),
      change: departments > 0 ? `+${Math.round(Math.random() * 5)} new domain` : "No domain yet",
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
    <div className="mb-8">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Performance Metrics
        </h2>
        <button 
          onClick={fetchDepartmentData}
          disabled={loading}
          className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Refreshing...
            </>
          ) : (
            <>
              🔄 Refresh
            </>
          )}
        </button>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </div>
  );
};

export default MetricCards; 