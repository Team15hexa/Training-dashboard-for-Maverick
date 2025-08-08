import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { useDarkMode } from "@/contexts/DarkModeContext";

export type StatusType = "completed" | "pending" | "in-progress" | "not-started" | "submitted";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { darkMode } = useDarkMode();
  
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case "completed":
        return {
          label: "Completed",
          variant: "default" as const,
          className: darkMode 
            ? "bg-green-900/30 text-green-400 border-green-500/50" 
            : "bg-green-100 text-green-800 hover:bg-green-200"
        };
      case "submitted":
        return {
          label: "Submitted",
          variant: "default" as const,
          className: darkMode 
            ? "bg-blue-900/30 text-blue-400 border-blue-500/50" 
            : "bg-blue-100 text-blue-800 hover:bg-blue-200"
        };
      case "in-progress":
        return {
          label: "In Progress",
          variant: "default" as const,
          className: darkMode 
            ? "bg-yellow-900/30 text-yellow-400 border-yellow-500/50" 
            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
        };
      case "pending":
        return {
          label: "Pending",
          variant: "secondary" as const,
          className: darkMode 
            ? "bg-gray-800 text-gray-300 border-gray-600" 
            : "bg-gray-100 text-gray-800"
        };
      case "not-started":
        return {
          label: "Not Started",
          variant: "outline" as const,
          className: darkMode 
            ? "border-gray-600 text-gray-400" 
            : "border-gray-300 text-gray-600"
        };
      default:
        return {
          label: "Unknown",
          variant: "secondary" as const,
          className: darkMode 
            ? "bg-gray-800 text-gray-300 border-gray-600" 
            : "bg-gray-100 text-gray-800"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
} 