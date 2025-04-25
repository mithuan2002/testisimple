import React from "react";
import StatsCard from "./StatsCard";
import { Megaphone, Users, MessageSquare, ClipboardList } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function DashboardStats() {
  // Fetch stats data from the API
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  // If the data is still loading, show a simple loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-4 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div className="w-1/2">
                <div className="h-4 bg-slate-200 rounded-md w-3/4 mb-2"></div>
                <div className="h-6 bg-slate-200 rounded-md w-1/2"></div>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-200"></div>
            </div>
            <div className="mt-2 h-4 bg-slate-200 rounded-md w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard
        title="Active Campaigns"
        value={stats?.activeCampaigns || 0}
        icon={<Megaphone />}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-500"
        changePercentage={stats?.campaignIncrease || 0}
        changeText="from last month"
      />
      <StatsCard
        title="Total Contacts"
        value={stats?.totalContacts || 0}
        icon={<Users />}
        iconBgColor="bg-green-100"
        iconColor="text-green-500"
        changePercentage={stats?.contactIncrease || 0}
        changeText="from last month"
      />
      <StatsCard
        title="Message Delivery"
        value={stats?.messageDelivery || "0%"}
        icon={<MessageSquare />}
        iconBgColor="bg-indigo-100"
        iconColor="text-indigo-500"
        changePercentage={stats?.deliveryIncrease || 0}
        changeText="from last campaign"
      />
      <StatsCard
        title="Form Submissions"
        value={stats?.formSubmissions || 0}
        icon={<ClipboardList />}
        iconBgColor="bg-amber-100"
        iconColor="text-amber-500"
        changePercentage={stats?.submissionIncrease || 0}
        changeText="from last campaign"
      />
    </div>
  );
}
