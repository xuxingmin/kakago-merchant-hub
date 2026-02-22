import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import MerchantBanner from "./components/MerchantBanner";
import WorkPage from "./pages/WorkPage";
import DataPage from "./pages/DataPage";
import InventoryPage from "./pages/InventoryPage";
import ProfilePage from "./pages/ProfilePage";
import SettlementPage from "./pages/SettlementPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <MerchantBanner />
          <Routes>
            <Route path="/" element={<WorkPage />} />
            <Route path="/data" element={<DataPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settlement" element={<SettlementPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <BottomNav />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
