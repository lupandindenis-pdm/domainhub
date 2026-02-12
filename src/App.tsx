import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DomainsPage from "./pages/DomainsPage";
import DomainDetailPage from "./pages/DomainDetailPage";
import FoldersPage from "./pages/FoldersPage";
import FolderDetailPage from "./pages/FolderDetailPage";
import UsersPage from "./pages/UsersPage";
import UserInvitePage from "./pages/UserInvitePage";
import UserEditPage from "./pages/UserEditPage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route path="/domains" element={<DomainsPage />} />
          <Route path="/domains/:id" element={<DomainDetailPage />} />
          <Route path="/folders" element={<FoldersPage />} />
          <Route path="/folders/:id" element={<FolderDetailPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/users/invite" element={<UserInvitePage />} />
          <Route path="/users/:id/edit" element={<UserEditPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
