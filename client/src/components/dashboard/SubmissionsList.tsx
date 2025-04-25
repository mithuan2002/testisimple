import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Submission } from "@shared/schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trophy, Instagram, Image } from "lucide-react";
import AssignPointsModal from "../modals/AssignPointsModal";
import { Badge } from "@/components/ui/badge";

export default function SubmissionsList() {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | undefined>(undefined);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);

  const { data: submissions, isLoading } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
  });

  const handleAssignPoints = (submission: Submission) => {
    setSelectedSubmission(submission);
    setIsPointsModalOpen(true);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <Instagram className="h-4 w-4 mr-1 text-pink-500" />;
      default:
        return <Image className="h-4 w-4 mr-1" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4">
                <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="h-8 bg-slate-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {submissions && submissions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getPlatformIcon(submission.platform)}
                          <span className="capitalize">{submission.platform}</span>
                        </div>
                      </TableCell>
                      <TableCell>{submission.engagementCount}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="flex items-center w-fit gap-1">
                          <Trophy className="h-3 w-3 text-amber-500" />
                          {submission.points || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>{submission.submittedAt}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => handleAssignPoints(submission)}
                        >
                          <Trophy className="h-4 w-4 text-amber-500" />
                          Assign Points
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500">
              No submissions yet
            </div>
          )}
        </CardContent>
      </Card>

      <AssignPointsModal
        isOpen={isPointsModalOpen}
        onClose={() => setIsPointsModalOpen(false)}
        submission={selectedSubmission}
      />
    </>
  );
}