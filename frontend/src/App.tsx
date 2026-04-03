import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "./components/shared/AuthLayout";
import Login from "./pages/login";
import Signup from "./pages/signup";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "sonner";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import Home from "./pages/Home";
import RootLayout from "./components/shared/RootLayout";

/**
 * CodeArena Main Application Shell
 * Standard routing for Auth and Dashboard flows
 */
function App() {
  const { getCurrentUser } = useAuthStore();

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <Toaster richColors />
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
          </Route>
          
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
