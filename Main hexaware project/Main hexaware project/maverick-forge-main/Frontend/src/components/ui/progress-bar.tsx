import { cn } from "@/lib/utils";
import { useDarkMode } from "@/contexts/DarkModeContext";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: "primary" | "success" | "warning" | "info";
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className, 
  color = "primary",
  showLabel = true,
  label 
}: ProgressBarProps) {
  const { darkMode } = useDarkMode();
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    primary: "bg-blue-600",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    info: "bg-blue-600"
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
            {label || `Progress`}
          </span>
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-lg h-2.5 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-lg",
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
} 