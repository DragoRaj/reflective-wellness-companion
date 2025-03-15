
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light">
      <div className="transition-colors duration-500">
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" expand={true} richColors closeButton />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              {/* Redirect tab routes to the main page with query parameters */}
              <Route path="/express" element={<Navigate to="/?tab=rant" replace />} />
              <Route path="/chat" element={<Navigate to="/?tab=chat" replace />} />
              <Route path="/journal" element={<Navigate to="/?tab=journal" replace />} />
              <Route path="/analyze" element={<Navigate to="/?tab=content" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </div>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
