import React from "react";
import {
  Upload,
  UserPlus,
  Megaphone,
  Award,
  Bell,
  Activity as ActivityIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities/recent"],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "upload":
        return <Upload className="h-4 w-4" />;
      case "contact":
        return <UserPlus className="h-4 w-4" />;
      case "campaign":
        return <Megaphone className="h-4 w-4" />;
      case "award":
        return <Award className="h-4 w-4" />;
      case "notification":
        return <Bell className="h-4 w-4" />;
      default:
        return <ActivityIcon className="h-4 w-4" />;
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case "upload":
        return "bg-blue-100 text-blue-500";
      case "contact":
        return "bg-green-100 text-green-500";
      case "campaign":
        return "bg-indigo-100 text-indigo-500";
      case "award":
        return "bg-amber-100 text-amber-500";
      case "notification":
        return "bg-red-100 text-red-500";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-4 border-b border-slate-200">
          <CardTitle className="text-lg font-semibold text-slate-800">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-200 mt-1"></div>
                <div className="ml-3 space-y-1 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 border-b border-slate-200">
        <CardTitle className="text-lg font-semibold text-slate-800">
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {(activities || []).map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full mt-1 ${getActivityBgColor(
                  activity.type
                )}`}
              >
                {getActivityIcon(activity.type)}
              </div>
              <div className="ml-3">
                <p
                  className="text-sm text-slate-800"
                  dangerouslySetInnerHTML={{ __html: activity.message }}
                ></p>
                <p className="text-xs text-slate-500 mt-1">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
