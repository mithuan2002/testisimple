import React from "react";
import { Link } from "wouter";
import {
  Calendar,
  CheckSquare,
  Edit,
  Eye,
  Share2,
  Trash2,
  Users,
  Send,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Campaign } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type CampaignCardProps = {
  campaign: Campaign;
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: number) => void;
  onResendSms: (id: number) => void;
  onViewForm?: (campaign: Campaign) => void;
};

export default function CampaignCard({
  campaign,
  onEdit,
  onDelete,
  onResendSms,
  onViewForm,
}: CampaignCardProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/campaign/${campaign.id}`
      );
      toast({
        title: "Link copied to clipboard",
        description: "You can now share this campaign with others",
      });
    } catch (err) {
      toast({
        title: "Failed to copy link",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-white overflow-hidden">
      <CardHeader className="p-4 border-b border-slate-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">
              {campaign.title}
            </h3>
            <div className="flex items-center mt-1 text-sm text-slate-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {campaign.startDate} - {campaign.endDate}
              </span>
              <span className="mx-2">•</span>
              <Badge
                variant="outline"
                className={
                  campaign.status === "active"
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                }
              >
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-blue-500"
              onClick={() => onEdit(campaign)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-500 hover:text-red-500"
              onClick={() => onDelete(campaign.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <p className="text-sm text-slate-600">{campaign.description}</p>

        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center text-sm text-slate-600">
            <Users className="h-4 w-4 mr-2 text-blue-500" />
            <span>2,540 contacts notified</span>
          </div>
          <div className="flex items-center text-sm text-slate-600">
            <CheckSquare className="h-4 w-4 mr-2 text-green-500" />
            <span>186 submissions</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            size="sm"
            variant="outline"
            className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
            asChild
          >
            <Link href={`/campaigns/${campaign.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share Link
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
            onClick={() => onResendSms(campaign.id)}
          >
            <Send className="h-4 w-4 mr-1" />
            Resend SMS
          </Button>
          {onViewForm && (
            <Button
              size="sm"
              variant="outline"
              className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100"
              onClick={() => onViewForm(campaign)}
            >
              <Smartphone className="h-4 w-4 mr-1" />
              Form Preview
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
