import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import MerchantBanner from "./components/MerchantBanner";
import OnboardingGate, { LockedBusinessOverlay } from "./components/OnboardingGate";
import StageSwitcher from "./components/StageSwitcher";
import { OnboardingProvider, useOnboarding } from "./contexts/OnboardingContext";
import WorkPage from "./pages/WorkPage";
import DataPage from "./pages/DataPage";
import InventoryPage from "./pages/InventoryPage";
import ProfilePage from "./pages/ProfilePage";
import SettlementPage from "./pages/SettlementPage";
import InvoicePage from "./pages/InvoicePage";
import ComplaintsPage from "./pages/ComplaintsPage";
import SigningChamber from "./pages/SigningChamber";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const location = useLocation();
  const { stage } = useOnboarding();
  const isProfile = location.pathname === "/profile";
  const onSigning = location.pathname === "/signing";

  // During review stage, business modules outside the profile page are locked.
  const businessLocked = stage === "review" && !isProfile && !onSigning;

  return (
    <div className="min-h-screen bg-background">
      {!onSigning && <MerchantBanner showBroadcast={isProfile} />}
      <div className="relative min-h-[60vh]">
        <Routes>
          <Route path="/" element={<WorkPage />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settlement" element={<SettlementPage />} />
          <Route path="/invoice" element={<InvoicePage />} />
          <Route path="/signing" element={<SigningChamber />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {businessLocked && <LockedBusinessOverlay />}
      </div>
      {!onSigning && <BottomNav />}
      <OnboardingGate />
      <StageSwitcher />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <OnboardingProvider>
          <AppContent />
        </OnboardingProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
