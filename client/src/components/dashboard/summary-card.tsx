import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  title: string;
  amount: number;
  percentChange: number;
  isPercentage?: boolean;
  isNegative?: boolean;
  icon?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export default function SummaryCard({
  title,
  amount,
  percentChange,
  isPercentage = false,
  isNegative = false,
  icon,
  iconBgColor = "bg-blue-500/20",
  iconColor = "text-blue-500"
}: SummaryCardProps) {
  
  // Format currency with INR symbol
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: isPercentage ? 'percent' : 'currency',
      currency: 'INR',
      maximumFractionDigits: isPercentage ? 1 : 2,
      minimumFractionDigits: isPercentage ? 1 : 2
    }).format(isPercentage ? value / 100 : value);
  };

  return (
    <div className="bg-dark-700 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-400">{title}</h2>
        <div className={cn("p-2 rounded-full", iconBgColor)}>
          {icon && (
            <span className={cn("material-icons", iconColor)}>{icon}</span>
          )}
        </div>
      </div>
      <p className="text-2xl font-semibold text-white mb-1">
        {formatCurrency(amount)}
      </p>
      <div className={cn(
        "flex items-center",
        percentChange > 0 ? "text-green-500" : "text-rose-500"
      )}>
        {percentChange > 0 ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        <span className="text-sm font-medium">{Math.abs(percentChange).toFixed(1)}%</span>
      </div>
    </div>
  );
}
