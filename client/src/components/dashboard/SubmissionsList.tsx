import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Submission, Campaign } from "@shared/schema";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Instagram, Camera, ExternalLink } from "lucide-react";
import AssignPointsModal from "../modals/AssignPointsModal";

export default function SubmissionsList() {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isAssignPointsModalOpen, setIsAssignPointsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
  });

  // Fetch campaigns to display campaign name
  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["/api/campaigns"],
  });

  // Update submission points
  const updateSubmission = useMutation({
    mutationFn: async ({ id, engagementCount }: { id: number; engagementCount: number }) => {
      return apiRequest("PATCH", `/api/submissions/${id}/points`, { engagementCount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      toast({
        title: "Points assigned",
        description: "Engagement points have been updated successfully.",
      });
      setIsAssignPointsModalOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to assign points",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAssignPoints = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsAssignPointsModalOpen(true);
  };

  const getCampaignTitle = (campaignId: number) => {
    if (!campaigns) return "Unknown Campaign";
    const campaign = campaigns.find((c) => c.id === campaignId);
    return campaign ? campaign.title : "Unknown Campaign";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-bold">User Submissions</CardTitle>
        <CardDescription>
          View and manage submissions from your campaigns
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingSubmissions ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-slate-200 p-4 animate-pulse"
              >
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded w-32"></div>
                    <div className="h-3 bg-slate-200 rounded w-48"></div>
                  </div>
                  <div className="h-8 bg-slate-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : submissions && submissions.length > 0 ? (
          <Table>
            <TableCaption>A list of all submissions from your campaigns.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    {submission.name}
                    <div className="text-xs text-gray-500">{submission.email}</div>
                  </TableCell>
                  <TableCell>{getCampaignTitle(submission.campaignId)}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={
                        submission.platform === "instagram" 
                          ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0" 
                          : "bg-yellow-400 text-black border-0"
                      }
                    >
                      {submission.platform === "instagram" ? (
                        <Instagram className="h-3 w-3 mr-1" />
                      ) : (
                        <Camera className="h-3 w-3 mr-1" />
                      )}
                      {submission.platform === "instagram" ? "Instagram" : "Snapchat"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(submission.submittedAt), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800 border-0">
                      <Award className="h-3 w-3 mr-1" />
                      {submission.engagementCount} points
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(submission.screenshotUrl, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleAssignPoints(submission)}
                      >
                        <Award className="h-3 w-3 mr-1" />
                        Points
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500 mb-4">No submissions yet</p>
            <p className="text-sm text-slate-400">
              Submissions will appear here when customers engage with your campaigns
            </p>
          </div>
        )}
      </CardContent>

      <AssignPointsModal
        isOpen={isAssignPointsModalOpen}
        onClose={() => setIsAssignPointsModalOpen(false)}
        submission={selectedSubmission || undefined}
      />
    </Card>
  );
}