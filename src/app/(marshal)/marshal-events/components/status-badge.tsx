import { Calendar as CalendarIcon, Check, X } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let badgeClass = "";
  let icon = null;

  switch (status.toLowerCase()) {
    case "upcoming":
      badgeClass = "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      icon = <CalendarIcon className="w-3 h-3" />;
      break;
    case "active":
      badgeClass = "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800";
      icon = <Check className="w-3 h-3" />;
      break;
    case "completed":
      badgeClass = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
      icon = <Check className="w-3 h-3" />;
      break;
    case "cancelled":
      badgeClass = "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      icon = <X className="w-3 h-3" />;
      break;
    default:
      badgeClass = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800";
      break;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeClass}`}>
      {icon}
      <span className="capitalize">{status}</span>
    </div>
  );
} 