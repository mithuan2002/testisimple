import React from "react";
import { Trophy } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

type Promoter = {
  id: number;
  name: string;
  points: number;
  rank: number;
};

export default function Leaderboard() {
  const { data: promoters, isLoading } = useQuery<Promoter[]>({
    queryKey: ["/api/leaderboard/top"],
  });

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-blue-100 text-blue-800";
      case 2:
        return "bg-slate-100 text-slate-800";
      case 3:
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getTrophyColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-amber-500";
      case 2:
        return "text-gray-500";
      case 3:
        return "text-amber-700";
      default:
        return "text-gray-500";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="p-4 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-slate-800">
              Top Promoters
            </CardTitle>
            <Link href="/leaderboard" className="text-sm text-blue-600 hover:text-blue-800 transition">
              View All
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                      <div className="h-3 bg-slate-200 rounded w-16"></div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-slate-800">
            Top Promoters
          </CardTitle>
          <Link href="/leaderboard" className="text-sm text-blue-600 hover:text-blue-800 transition">
            View All
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {(promoters || []).map((promoter) => (
            <div key={promoter.id} className="flex items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full font-medium text-sm ${getRankStyle(
                  promoter.rank
                )}`}
              >
                {promoter.rank}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-slate-800">
                      {promoter.name}
                    </span>
                    <div className="flex items-center text-xs text-slate-500">
                      <Trophy
                        className={`h-3 w-3 mr-1 ${getTrophyColor(
                          promoter.rank
                        )}`}
                      />
                      <span>{promoter.points}</span> points
                    </div>
                  </div>
                  <Avatar>
                    <AvatarFallback className="bg-slate-200 text-slate-700">
                      {promoter.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
