import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import Campaigns from "@/pages/Campaigns";
import Contacts from "@/pages/Contacts";
import LeaderboardPage from "@/pages/LeaderboardPage";
import CampaignDetailPage from "@/pages/CampaignDetailPage";
import { RequireAuth } from "@/lib/auth";
import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import CampaignForm from "@/components/common/CampaignForm";

function Router() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleOpenSidebar = () => {
    setIsMobileOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsMobileOpen(false);
  };

  // Public routes
  const PublicRoutes = () => (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/campaign/:id">
        {(params) => <CampaignForm campaignId={Number(params.id)} title="Campaign" description="Share and win prizes!" platforms={["instagram", "snapchat"]} />}
      </Route>
    </Switch>
  );

  // Protected routes with layout
  const ProtectedRoutesWithLayout = () => (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isMobileOpen={isMobileOpen} onCloseSidebar={handleCloseSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onOpenSidebar={handleOpenSidebar} />

        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/campaigns" component={Campaigns} />
            <Route path="/campaigns/:id">
              {(params) => <CampaignDetailPage id={Number(params.id)} />}
            </Route>
            <Route path="/contacts" component={Contacts} />
            <Route path="/leaderboard" component={LeaderboardPage} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );

  return (
    <Switch>
      <Route path="/login" component={PublicRoutes} />
      <Route path="/campaign/:id" component={PublicRoutes} />
      <Route>
        <RequireAuth>
          <ProtectedRoutesWithLayout />
        </RequireAuth>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
