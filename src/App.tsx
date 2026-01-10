import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/planner/AuthPage";
import VendorAuthPage from "./pages/vendor/VendorAuthPage";
import PlannerLayout from "./components/PlannerLayout";
import VendorLayout from "./components/VendorLayout";
import DashboardHome from "./pages/planner/DashboardHome";
import MyEvents from "./pages/planner/MyEvents";
import CreateEvent from "./pages/planner/CreateEvent";
import VendorDiscovery from "./pages/planner/VendorDiscovery";
import BudgetTracking from "./pages/planner/BudgetTracking";
import GuestManagement from "./pages/planner/GuestManagement";
import Messages from "./pages/planner/Messages";
import Settings from "./pages/planner/Settings";
import Profile from "./pages/planner/Profile";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProfile from "./pages/vendor/VendorProfile";
import VendorProfileView from "./pages/vendor/VendorProfileView";
import VendorServices from "./pages/vendor/VendorServices";
import VendorBookings from "./pages/vendor/VendorBookings";
import VendorReviews from "./pages/vendor/VendorReviews";
import VendorAnalytics from "./pages/vendor/VendorAnalytics";
import VendorMessages from "./pages/vendor/VendorMessages";
import VendorSettings from "./pages/vendor/VendorSettings";
import RsvpPage from "./pages/public/RsvpPage";
import InstallPage from "./pages/public/InstallPage";
import BackgroundPatternsDemo from "./pages/public/BackgroundPatternsDemo";
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
            <Route path="guests" element={<GuestManagement />} />
            <Route path="budget" element={<BudgetTracking />} />
            <Route path="messages" element={<Messages />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Vendor Portal Routes */}
          <Route path="/vendor" element={<VendorLayout />}>
            <Route index element={<VendorDashboard />} />
            <Route path="business" element={<VendorProfile />} />
            <Route path="profile" element={<VendorProfileView />} />
            <Route path="services" element={<VendorServices />} />
            <Route path="bookings" element={<VendorBookings />} />
            <Route path="reviews" element={<VendorReviews />} />
            <Route path="analytics" element={<VendorAnalytics />} />
            <Route path="messages" element={<VendorMessages />} />
            <Route path="settings" element={<VendorSettings />} />
          </Route>
          
          {/* Public RSVP Page */}
          <Route path="/rsvp/:eventId" element={<RsvpPage />} />
          
          {/* Install PWA Page */}
          <Route path="/install" element={<InstallPage />} />
          
          {/* Background Patterns Demo */}
          <Route path="/patterns" element={<BackgroundPatternsDemo />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
