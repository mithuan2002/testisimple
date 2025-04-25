import React, { useState } from "react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import CampaignCard from "@/components/dashboard/CampaignCard";
import Leaderboard from "@/components/dashboard/Leaderboard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import NewCampaignModal from "@/components/modals/NewCampaignModal";
import MobileFormPreview from "@/components/modals/MobileFormPreview";
import { Button } from "@/components/ui/button";
import { Megaphone } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Campaign } from "@shared/schema";

export default function Dashboard() {
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch campaigns from the API
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Delete campaign mutation
  const deleteCampaign = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/campaigns/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Campaign deleted",
        description: "The campaign has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete campaign",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Resend SMS mutation
  const resendSms = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/campaigns/${id}/resend-sms`, {});
    },
    onSuccess: () => {
      toast({
        title: "SMS notifications sent",
        description: "SMS notifications have been resent to all contacts.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to send SMS",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditCampaign = (campaign: Campaign) => {
    // In a real app, this would open an edit modal
    toast({
      title: "Edit Campaign",
      description: "Editing functionality would go here.",
    });
  };

  const handleDeleteCampaign = (id: number) => {
    if (window.confirm("Are you sure you want to delete this campaign?")) {
      deleteCampaign.mutate(id);
    }
  };

  const handleResendSms = (id: number) => {
    resendSms.mutate(id);
  };

  const handleViewCampaignForm = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsMobilePreviewOpen(true);
  };

  return (
    <div className="p-4 md:p-6">
      <DashboardStats />

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Active Campaigns
            </h2>
            <Button
              onClick={() => setIsNewCampaignModalOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
            >
              <Megaphone className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow overflow-hidden animate-pulse"
                >
                  <div className="p-4 border-b border-slate-200">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="h-5 bg-slate-200 rounded w-48"></div>
                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                      </div>
                      <div className="flex space-x-2">
                        <div className="w-8 h-8 bg-slate-200 rounded"></div>
                        <div className="w-8 h-8 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="flex space-x-4 mt-4">
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <div className="h-8 bg-slate-200 rounded w-24"></div>
                      <div className="h-8 bg-slate-200 rounded w-24"></div>
                      <div className="h-8 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(campaigns || []).map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onEdit={handleEditCampaign}
                  onDelete={handleDeleteCampaign}
                  onResendSms={handleResendSms}
                  onViewForm={handleViewCampaignForm}
                />
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/3 space-y-6">
          <Leaderboard />
          <RecentActivity />
        </div>
      </div>

      <NewCampaignModal
        isOpen={isNewCampaignModalOpen}
        onClose={() => setIsNewCampaignModalOpen(false)}
      />

      <MobileFormPreview
        isOpen={isMobilePreviewOpen}
        onClose={() => setIsMobilePreviewOpen(false)}
        campaign={selectedCampaign || undefined}
      />
    </div>
  );
}
