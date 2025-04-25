import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import MobileFormPreview from "@/components/modals/MobileFormPreview";
import { apiRequest } from "@/lib/queryClient";
import { Campaign, Submission } from "@shared/schema";
import {
  Calendar,
  Users,
  MessageSquare,
  Eye,
  Share2,
  Send,
  ArrowLeft,
  FileText,
  BarChart2,
  ExternalLink,
  Smartphone,
} from "lucide-react";
import { Link } from "wouter";
import { FaInstagram, FaSnapchat } from "react-icons/fa";

type CampaignDetailPageProps = {
  id: number;
};

export default function CampaignDetailPage({ id }: CampaignDetailPageProps) {
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch campaign details
  const { data: campaign, isLoading: isLoadingCampaign } = useQuery<Campaign>({
    queryKey: [`/api/campaigns/${id}`],
  });

  // Fetch campaign submissions
  const { data: submissions, isLoading: isLoadingSubmissions } = useQuery<Submission[]>({
    queryKey: [`/api/campaigns/${id}/submissions`],
  });

  // Resend SMS mutation
  const resendSms = useMutation({
    mutationFn: async () => {
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

  const handleResendSms = () => {
    resendSms.mutate();
  };

  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/campaign/${id}`
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

  if (isLoadingCampaign) {
    return (
      <div className="p-4 md:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-slate-800">
                Campaign Not Found
              </h2>
              <p className="text-slate-600 mt-2">
                The campaign you're looking for doesn't exist or has been deleted.
              </p>
              <Button asChild className="mt-4">
                <Link href="/campaigns">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Campaigns
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/campaigns">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{campaign.title}</CardTitle>
                  <div className="flex items-center mt-2 text-sm text-slate-500">
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
                    onClick={handleShareLink}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share Link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                    onClick={handleResendSms}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Resend SMS
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                    onClick={() => setIsMobilePreviewOpen(true)}
                  >
                    <Smartphone className="h-4 w-4 mr-1" />
                    Form Preview
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">
                    Campaign Description
                  </h3>
                  <p className="text-slate-700">{campaign.description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">
                    SMS Message
                  </h3>
                  <div className="bg-slate-50 p-3 rounded-md border text-slate-700">
                    {campaign.smsMessage}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-slate-500 mb-2">
                    Social Media Platforms
                  </h3>
                  <div className="flex gap-2">
                    {campaign.platforms.map((platform) => (
                      <Badge key={platform} className={platform === "instagram" ? "instagram-gradient text-white" : "snapchat-bg"}>
                        {platform === "instagram" ? (
                          <FaInstagram className="mr-1" />
                        ) : (
                          <FaSnapchat className="mr-1" />
                        )}
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-2">
                          <Users className="h-6 w-6" />
                        </div>
                        <p className="text-2xl font-semibold text-slate-800">2,540</p>
                        <p className="text-sm text-slate-500">Contacts Notified</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-500 mb-2">
                          <MessageSquare className="h-6 w-6" />
                        </div>
                        <p className="text-2xl font-semibold text-slate-800">98%</p>
                        <p className="text-sm text-slate-500">Delivery Rate</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 mb-2">
                          <FileText className="h-6 w-6" />
                        </div>
                        <p className="text-2xl font-semibold text-slate-800">
                          {submissions?.length || 0}
                        </p>
                        <p className="text-sm text-slate-500">Form Submissions</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Submissions</CardTitle>
              <CardDescription>
                View all form submissions for this campaign
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Submissions</TabsTrigger>
                  <TabsTrigger value="instagram">Instagram</TabsTrigger>
                  <TabsTrigger value="snapchat">Snapchat</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  {isLoadingSubmissions ? (
                    <div className="animate-pulse space-y-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 bg-slate-200 rounded"></div>
                      ))}
                    </div>
                  ) : submissions?.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No submissions yet for this campaign.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Platform</TableHead>
                          <TableHead>Engagement</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions?.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-medium">
                              {submission.name}
                            </TableCell>
                            <TableCell>{submission.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={submission.platform === "instagram" ? "instagram-gradient text-white" : "snapchat-bg"}>
                                {submission.platform === "instagram" ? (
                                  <FaInstagram className="mr-1" />
                                ) : (
                                  <FaSnapchat className="mr-1" />
                                )}
                                {submission.platform.charAt(0).toUpperCase() + submission.platform.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>{submission.engagementCount} likes</TableCell>
                            <TableCell>{submission.submittedAt}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
                
                <TabsContent value="instagram">
                  {isLoadingSubmissions ? (
                    <div className="animate-pulse space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-slate-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Engagement</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions
                          ?.filter((s) => s.platform === "instagram")
                          .map((submission) => (
                            <TableRow key={submission.id}>
                              <TableCell className="font-medium">
                                {submission.name}
                              </TableCell>
                              <TableCell>{submission.email}</TableCell>
                              <TableCell>{submission.engagementCount} likes</TableCell>
                              <TableCell>{submission.submittedAt}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
                
                <TabsContent value="snapchat">
                  {isLoadingSubmissions ? (
                    <div className="animate-pulse space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 bg-slate-200 rounded"></div>
                      ))}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Engagement</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {submissions
                          ?.filter((s) => s.platform === "snapchat")
                          .map((submission) => (
                            <TableRow key={submission.id}>
                              <TableCell className="font-medium">
                                {submission.name}
                              </TableCell>
                              <TableCell>{submission.email}</TableCell>
                              <TableCell>{submission.engagementCount} views</TableCell>
                              <TableCell>{submission.submittedAt}</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" size="sm" onClick={() => setIsMobilePreviewOpen(true)}>
                <Smartphone className="h-4 w-4 mr-2" />
                Preview Form
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm" onClick={handleShareLink}>
                <Share2 className="h-4 w-4 mr-2" />
                Copy Form Link
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm" onClick={handleResendSms}>
                <Send className="h-4 w-4 mr-2" />
                Resend SMS to All
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm">
                <BarChart2 className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
              <Button className="w-full justify-start" variant="outline" size="sm" asChild>
                <a href={`/campaign/${id}`} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Live Form
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSubmissions ? (
                <div className="animate-pulse space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 w-12 bg-slate-200 rounded"></div>
                    </div>
                  ))}
                </div>
              ) : submissions?.length === 0 ? (
                <div className="text-center py-4 text-slate-500">
                  No submissions yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions
                    ?.sort((a, b) => b.engagementCount - a.engagementCount)
                    .slice(0, 5)
                    .map((submission, index) => (
                      <div key={submission.id} className="flex items-center">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full font-medium text-sm ${
                          index === 0
                            ? "bg-blue-100 text-blue-800"
                            : index === 1
                            ? "bg-slate-100 text-slate-800"
                            : index === 2
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-800"
                        }`}>
                          {index + 1}
                        </div>
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-slate-800">
                                {submission.name}
                              </span>
                              <div className="flex items-center text-xs text-slate-500">
                                <Badge variant="outline" className={submission.platform === "instagram" ? "instagram-gradient text-white" : "snapchat-bg"}>
                                  {submission.platform}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-sm font-semibold">
                              {submission.engagementCount}
                              <span className="text-xs ml-1 text-slate-500">
                                {submission.platform === "instagram" ? "likes" : "views"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileFormPreview
        isOpen={isMobilePreviewOpen}
        onClose={() => setIsMobilePreviewOpen(false)}
        campaign={campaign}
      />
    </div>
  );
}
