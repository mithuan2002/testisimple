import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trophy, Search } from "lucide-react";

type LeaderboardEntry = {
  id: number;
  name: string;
  email: string;
  rank: number;
  points: number;
  submissionCount: number;
  topCampaign: string;
  lastSubmission: string;
};

export default function LeaderboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch leaderboard data
  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard"],
  });

  // Filter entries based on search term
  const filteredEntries = leaderboard?.filter(
    (entry) =>
      entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRankClass = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-amber-500";
      case 2:
        return "text-gray-500";
      case 3:
        return "text-amber-700";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-amber-500" />
            Promoter Leaderboard
          </CardTitle>
          <CardDescription>
            Your top customers ranked by their engagement and participation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <Search className="mr-2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search promoters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-slate-200 rounded"></div>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-16 bg-slate-200 rounded"></div>
              ))}
            </div>
          ) : (
            <Table>
              <TableCaption>
                Updated {new Date().toLocaleDateString()}
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Promoter</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Top Campaign</TableHead>
                  <TableHead>Last Submission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries?.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full font-medium ${
                          entry.rank <= 3 ? "bg-amber-50" : "bg-slate-50"
                        }`}
                      >
                        <Trophy
                          className={`h-4 w-4 ${getRankClass(entry.rank)}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback className="bg-slate-200 text-slate-700">
                          {entry.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{entry.name}</div>
                        <div className="text-sm text-slate-500">
                          {entry.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-lg">
                        {entry.points.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>{entry.submissionCount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
                        {entry.topCampaign}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {entry.lastSubmission}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
