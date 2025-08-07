import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export type StatusType = "completed" | "pending" | "in-progress" | "not-started" | "submitted";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case "completed":
        return {
          label: "Completed",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 hover:bg-green-200"
        };
      case "submitted":
        return {
          label: "Submitted",
          variant: "default" as const,
          className: "bg-blue-100 text-blue-800 hover:bg-blue-200"
        };
      case "in-progress":
        return {
          label: "In Progress",
          variant: "default" as const,
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
        };
      case "pending":
        return {
          label: "Pending",
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-800"
        };
      case "not-started":
        return {
          label: "Not Started",
          variant: "outline" as const,
          className: "border-gray-300 text-gray-600"
        };
      default:
        return {
          label: "Unknown",
          variant: "secondary" as const,
          className: "bg-gray-100 text-gray-800"
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