import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/planner/AuthPage";
import VendorAuthPage from "./pages/vendor/VendorAuthPage";
import PlannerLayout from "./components/PlannerLayout";
import DashboardHome from "./pages/planner/DashboardHome";
import MyEvents from "./pages/planner/MyEvents";
import CreateEvent from "./pages/planner/CreateEvent";
import VendorDiscovery from "./pages/planner/VendorDiscovery";
import BudgetTracking from "./pages/planner/BudgetTracking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/planner" element={<AuthPage />} />
          <Route path="/auth/vendor" element={<VendorAuthPage />} />
          
          {/* Planner Dashboard Routes */}
          <Route path="/dashboard" element={<PlannerLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="events" element={<MyEvents />} />
            <Route path="events/new" element={<CreateEvent />} />
            <Route path="events/:id" element={<MyEvents />} />
            <Route path="vendors" element={<VendorDiscovery />} />
            <Route path="guests" element={<div className="text-center py-16"><h1 className="text-2xl font-display">Guest Management - Coming Soon</h1></div>} />
            <Route path="budget" element={<BudgetTracking />} />
            <Route path="messages" element={<div className="text-center py-16"><h1 className="text-2xl font-display">Messages - Coming Soon</h1></div>} />
            <Route path="settings" element={<div className="text-center py-16"><h1 className="text-2xl font-display">Settings - Coming Soon</h1></div>} />
          </Route>

          {/* Vendor Routes - Placeholder */}
          <Route path="/vendor" element={<div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-display">Vendor Dashboard - Coming Soon</h1></div>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
