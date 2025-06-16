
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Feed from "./pages/Feed";
import Index from "./pages/Index";
import CreateTopic from "./pages/CreateTopic";
import TopicView from "./pages/TopicView";
import CategoryView from "./pages/CategoryView";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSettings from "./pages/AdminSettings";
import NotFound from "./pages/NotFound";
import AdminCategories from "./pages/AdminCategories";
import AdminUsers from "./pages/AdminUsers";
import AdminPermissions from "./pages/AdminPermissions";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <main>
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">جاري التحميل...</p>
                    </div>
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/create-topic" element={<CreateTopic />} />
                  <Route path="/topic/:slug" element={<TopicView />} />
                  <Route path="/category/:slug" element={<CategoryView />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/u/:username" element={<UserProfile />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/settings" element={<AdminSettings />} />
                  <Route path="/admin/categories" element={<AdminCategories />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/permissions" element={<AdminPermissions />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
