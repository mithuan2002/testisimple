import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Award, Instagram, Camera } from "lucide-react";
import { format } from "date-fns";
import { Submission } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Define schema for point assignment
const pointsFormSchema = z.object({
  engagementCount: z.coerce
    .number()
    .min(0, "Points must be at least 0")
    .max(100, "Points cannot exceed 100"),
});

type PointsFormValues = z.infer<typeof pointsFormSchema>;

type AssignPointsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  submission?: Submission;
};

export default function AssignPointsModal({
  isOpen,
  onClose,
  submission,
}: AssignPointsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form
  const form = useForm<PointsFormValues>({
    resolver: zodResolver(pointsFormSchema),
    defaultValues: {
      engagementCount: submission?.engagementCount || 0,
    },
  });

  // Update when the submission prop changes
  React.useEffect(() => {
    if (submission) {
      form.reset({
        engagementCount: submission.engagementCount,
      });
    }
  }, [submission, form]);

  // Create update mutation
  const updateSubmission = useMutation({
    mutationFn: async (data: PointsFormValues) => {
      if (!submission) return null;
      return apiRequest("PATCH", `/api/submissions/${submission.id}/points`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      toast({
        title: "Points assigned",
        description: "Engagement points have been updated successfully.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to assign points",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PointsFormValues) => {
    updateSubmission.mutate(data);
  };

  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5 text-amber-500" />
            Assign Engagement Points
          </DialogTitle>
          <DialogDescription>
            Reward this submission based on engagement quality and reach
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{submission.name}</p>
                <p className="text-sm text-slate-500">{submission.email}</p>
              </div>
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
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Submitted on</p>
              <p className="text-sm">
                {format(new Date(submission.submittedAt), "PPP")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Screenshot</p>
              <div className="mt-1">
                <a
                  href={submission.screenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm inline-flex items-center"
                >
                  View screenshot
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="engagementCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engagement Points</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormDescription>
                      Assign points based on the quality, reach, and impact of this social share.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="mt-2 sm:mt-0"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateSubmission.isPending}
                  className="mt-2 sm:mt-0"
                >
                  {updateSubmission.isPending ? "Saving..." : "Save Points"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}