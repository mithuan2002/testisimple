import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Campaign } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import NewCampaignModal from "@/components/modals/NewCampaignModal";
import MobileFormPreview from "@/components/modals/MobileFormPreview";
import { Eye, MoreHorizontal, Megaphone, Send, Edit, Trash2 } from "lucide-react";

export default function Campaigns() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch campaigns
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

  // Filter campaigns based on search term
  const filteredCampaigns = campaigns?.filter(
    (campaign) =>
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <CardTitle>Campaigns</CardTitle>
            <CardDescription>
              Manage your social media campaigns
            </CardDescription>
          </div>
          <Button onClick={() => setIsNewCampaignModalOpen(true)}>
            <Megaphone className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-10 bg-slate-200 rounded mb-4"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-slate-200 rounded mb-2"></div>
              ))}
            </div>
          ) : (
            <Table>
              <TableCaption>
                {filteredCampaigns?.length === 0
                  ? "No campaigns found"
                  : "A list of your campaigns"}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Platforms</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns?.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      {campaign.title}
                    </TableCell>
                    <TableCell>
                      {campaign.startDate} - {campaign.endDate}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          campaign.status === "active"
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                        }
                      >
                        {campaign.status.charAt(0).toUpperCase() +
                          campaign.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {campaign.platforms.map((platform) => (
                          <Badge key={platform} variant="secondary">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewCampaignForm(campaign)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview Form
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/campaigns/${campaign.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditCampaign(campaign)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleResendSms(campaign.id)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Resend SMS
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteCampaign(campaign.id)}
                            className="text-red-600 hover:text-red-700 focus:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
