import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Submission } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trophy } from 'lucide-react';

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
  const [points, setPoints] = React.useState<number>(submission?.points || 0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  React.useEffect(() => {
    if (submission) {
      setPoints(submission.points || 0);
    }
  }, [submission]);

  const assignPointsMutation = useMutation({
    mutationFn: async (data: { points: number }) => {
      const res = await apiRequest(
        'PATCH',
        `/api/submissions/${submission?.id}/points`,
        data
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Points assigned',
        description: `${points} points have been assigned to ${submission?.name}`,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/submissions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard/top'] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign points',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    assignPointsMutation.mutate({ points });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Assign Points
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Assign points to <span className="font-medium">{submission?.name}</span> for their
                submission on {submission?.platform}.
              </p>
              <p className="text-sm text-gray-500">
                They received <span className="font-medium">{submission?.engagementCount}</span> engagements.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={points}
                onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                className="col-span-3"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={assignPointsMutation.isPending}
            >
              {assignPointsMutation.isPending ? 'Saving...' : 'Save Points'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}