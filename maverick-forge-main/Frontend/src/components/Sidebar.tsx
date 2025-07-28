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
  User
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
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
      id: "tracker",
      label: "Tracker",
      icon: Activity,
      href: "/admin/tracker",
      isActive: location.pathname === "/admin/tracker"
    },
    {
      id: "agentic-framework",
      label: "Agentic Framework",
      icon: Brain,
      href: "/admin/agentic",
      isActive: location.pathname === "/admin/agentic"
    },
    {
      id: "monitoring",
      label: "Monitoring",
      icon: Monitor,
      href: "/admin/monitoring",
      isActive: location.pathname === "/admin/monitoring"
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
    <div className={cn("w-64 bg-blue-900 text-white h-screen flex flex-col", className)}>
      {/* Logo */}
      <div className="p-6 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-900 font-bold text-xl">M</span>
          </div>
          <span className="text-xl font-bold">MAVERICKS</span>
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
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                item.isActive 
                  ? "bg-blue-700 text-white" 
                  : "text-blue-100 hover:bg-blue-800 hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
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
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm",
                      subItem.isActive 
                        ? "bg-blue-700 text-white" 
                        : "text-blue-200 hover:bg-blue-800 hover:text-white"
                    )}
                  >
                    <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
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