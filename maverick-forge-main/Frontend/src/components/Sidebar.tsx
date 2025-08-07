import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Award,
  Activity,
  Brain,
  Monitor,
  FileText,
  Bell,
  UserPlus,
  User,
  Sparkles
} from "lucide-react";

interface SidebarProps {
  className?: string;
  darkMode?: boolean;
}

const Sidebar = ({ className, darkMode = false }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(["dashboard"]);

  const navigationItems = [
    {
      id: "netinch",
      label: "Netinch",
      icon: Activity,
      href: "/admin/netinch",
      isActive: location.pathname === "/admin/netinch"
    },
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin/dashboard",
      isActive: location.pathname === "/admin/dashboard",
      subItems: [
        {
          id: "dashboard-overview",
          label: "Dashboard Overview",
          href: "/admin/dashboard",
          isActive: location.pathname === "/admin/dashboard"
        }
      ]
    },
    {
      id: "manage-freshers",
      label: "Manage Freshers",
      icon: Users,
      href: "/admin/freshers",
      isActive: location.pathname === "/admin/freshers"
    },
    {
      id: "assessment-scores",
      label: "Assessment Scores",
      icon: BarChart3,
      href: "/admin/assessments",
      isActive: location.pathname === "/admin/assessments"
    },
    {
      id: "certification",
      label: "Certification",
      icon: Award,
      href: "/admin/certifications",
      isActive: location.pathname === "/admin/certifications"
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      href: "/admin/reports",
      isActive: location.pathname === "/admin/reports"
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className={cn(
      "w-64 h-screen flex flex-col dark-mode-transition",
      darkMode 
        ? "bg-black text-white border-r border-gray-800" 
        : "bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600 text-white",
      className
    )}>
      {/* Logo */}
      <div className={`p-6 border-b transition-all duration-300 ${
        darkMode ? 'border-gray-800' : 'border-white/20'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg' 
              : 'bg-white/20 backdrop-blur-sm shadow-lg'
          }`}>
            {darkMode ? (
              <Sparkles className="w-6 h-6 text-white" />
            ) : (
              <span className="text-white font-bold text-xl">M</span>
            )}
          </div>
          <div>
            <span className={`text-xl font-bold transition-colors duration-300 ${
              darkMode ? 'text-white' : 'text-white'
            }`}>MAVERICKS</span>
            <div className={`text-xs transition-colors duration-300 ${
              darkMode ? 'text-gray-300' : 'text-white/80'
            }`}>Training Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <div key={item.id}>
            <button
              onClick={() => {
                if (item.subItems) {
                  toggleExpanded(item.id);
                } else {
                  navigate(item.href);
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-300 hover:scale-105",
                item.isActive 
                  ? darkMode 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                    : "bg-white/20 backdrop-blur-sm text-white shadow-lg border border-white/30"
                  : darkMode
                    ? "text-gray-300 hover:bg-gray-900 hover:text-white" 
                    : "text-white/90 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={`w-5 h-5 transition-colors duration-300 ${
                item.isActive 
                  ? "text-white" 
                  : darkMode 
                    ? "text-gray-400" 
                    : "text-white/80"
              }`} />
              <span className="font-medium">{item.label}</span>
            </button>
            
            {/* Sub-items */}
            {item.subItems && expandedItems.includes(item.id) && (
              <div className="ml-8 mt-2 space-y-1">
                {item.subItems.map((subItem) => (
                  <button
                    key={subItem.id}
                    onClick={() => navigate(subItem.href)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-300 text-sm hover:scale-105",
                      subItem.isActive 
                        ? darkMode 
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg" 
                          : "bg-white/20 backdrop-blur-sm text-white shadow-lg border border-white/30"
                        : darkMode
                          ? "text-gray-400 hover:bg-gray-900 hover:text-white" 
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <span className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      subItem.isActive 
                        ? "bg-white" 
                        : darkMode 
                          ? "bg-gray-500" 
                          : "bg-white/60"
                    }`}></span>
                    {subItem.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 