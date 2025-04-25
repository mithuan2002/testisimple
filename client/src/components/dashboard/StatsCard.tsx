import React from "react";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  changePercentage?: number;
  changeText?: string;
};

export default function StatsCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  changePercentage,
  changeText,
}: StatsCardProps) {
  // Determine if it's a positive or negative change
  const isPositive = changePercentage && changePercentage > 0;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-semibold text-slate-800">{value}</p>
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            iconBgColor
          )}
        >
          {React.cloneElement(icon as React.ReactElement, {
            className: cn("text-xl", iconColor),
          })}
        </div>
      </div>
      {changePercentage !== undefined && changeText && (
        <div
          className={cn(
            "mt-2 text-sm",
            isPositive ? "text-green-600" : "text-red-600"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={cn(
              "inline mr-1 h-4 w-4",
              isPositive ? "rotate-0" : "rotate-180"
            )}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            {changePercentage}% {changeText}
          </span>
        </div>
      )}
    </div>
  );
}
