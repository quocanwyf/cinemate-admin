import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">
            {value.toLocaleString()}
          </p>
        </div>
        <div className={`${bgColor} ${iconColor} p-4 rounded-lg`}>
          <Icon size={28} />
        </div>
      </div>
    </div>
  );
}
