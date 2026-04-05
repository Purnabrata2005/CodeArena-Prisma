import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "./components/shared/AuthLayout";
import Login from "./pages/root/Login";
import Signup from "./pages/root/Signup";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "sonner";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect, useRef } from "react";
import Home from "./pages/root/Home";
import RootLayout from "./components/shared/RootLayout";
import { RequireAuthLayout } from "./components/shared/RequireAuthLayout";
import ProfilePage from "./pages/auth/ProfilePage";
import ProblemWorkspace from "./pages/auth/ProblemWorkspace";
import Problems from "./pages/auth/Problems";
import PlaylistPage from "./pages/auth/PlaylistPage";
import AddProblem from "./pages/admin/AddProblem";
import UpdateProblem from "./pages/admin/UpdateProblem";
import NotFound from "./pages/root/NotFound";
import About from "./pages/root/About";

/**
 * CodeArena Main Application Shell
 * Standard routing for Auth and Dashboard flows
 */
function App() {
  const { getCurrentUser } = useAuthStore();
  const hasFetchedCurrentUser = useRef(false);

  useEffect(() => {
    if (hasFetchedCurrentUser.current) return;
    hasFetchedCurrentUser.current = true;
    getCurrentUser();
  }, [getCurrentUser]);
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      {/* <div className="min-h-screen bg-background font-sans antialiased"> */}
      <Toaster richColors />
      <Routes>
        {/* Common Public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
        </Route>

        {/* Authenticated routes */}
        <Route element={<RequireAuthLayout />}>
          <Route element={<RootLayout />}>
            <Route path="/problems" element={<Problems />} />
            <Route path="/problems/:id" element={<ProblemWorkspace />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/playlist/:id" element={<PlaylistPage />} />
          </Route>
        </Route>

        {/* Admin-only routes */}
        <Route element={<RequireAuthLayout role="ADMIN" />}>
          <Route element={<RootLayout />}>
            <Route path="/add-problem" element={<AddProblem />} />
            <Route path="/update-problem/:id" element={<UpdateProblem />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* </div> */}
    </ThemeProvider>
  );
}

export default App;
