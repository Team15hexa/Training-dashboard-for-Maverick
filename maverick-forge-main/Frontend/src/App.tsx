import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import RoleSelection from "./pages/RoleSelection";
import FresherDashboard from "./pages/FresherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ManageFreshers from "./pages/ManageFreshers";
import AssessmentScores from "./pages/AssessmentScores";
import Certifications from "./pages/Certifications";
import NetInch from "./pages/NetInch";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { DarkModeProvider } from "./contexts/DarkModeContext";

const queryClient = new QueryClient();

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Prevent transitions during initial load
    document.documentElement.classList.add('no-transition');
    
    // Get saved dark mode preference
    const saved = localStorage.getItem('darkMode');
    const isDark = saved ? JSON.parse(saved) : false;
    
    // Apply dark mode immediately to prevent flash
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
    
    // Remove no-transition class after a short delay
    setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
      setIsLoading(false);
    }, 100);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <DarkModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Login />} />
              <Route path="/fresher-dashboard" element={
                <ProtectedRoute requiredRole="fresher">
                  <FresherDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/freshers" element={
                <ProtectedRoute requiredRole="admin">
                  <ManageFreshers />
                </ProtectedRoute>
              } />
              <Route path="/admin/assessments" element={
                <ProtectedRoute requiredRole="admin">
                  <AssessmentScores />
                </ProtectedRoute>
              } />
              <Route path="/admin/certifications" element={
                <ProtectedRoute requiredRole="admin">
                  <Certifications />
                </ProtectedRoute>
              } />
              <Route path="/admin/netinch" element={
                <ProtectedRoute requiredRole="admin">
                  <NetInch />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute requiredRole="admin">
                  <Reports />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DarkModeProvider>
    </QueryClientProvider>
  );
};

export default App;
