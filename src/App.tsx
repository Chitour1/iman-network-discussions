
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
// import Header from "@/components/layout/Header"; // Removed Header
import Index from "./pages/Index";
import CreateTopic from "./pages/CreateTopic";
import TopicView from "./pages/TopicView";
import CategoryView from "./pages/CategoryView";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            {/* <Header /> */} {/* Removed Header */}
            <main>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/create-topic" element={<CreateTopic />} />
                <Route path="/topic/:slug" element={<TopicView />} />
                <Route path="/category/:slug" element={<CategoryView />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
