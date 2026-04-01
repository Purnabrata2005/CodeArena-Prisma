import { Routes, Route, Navigate } from "react-router-dom";

import AuthLayout from "./components/shared/AuthLayout";
import Login from "./pages/login";
import Signup from "./pages/signup";
import { ThemeProvider } from "@/components/ui/theme-provider";

/**
 * CodeArena Main Application Shell
 * Standard routing for Auth and Dashboard flows
 */
function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen bg-background font-sans antialiased">
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} /> You can create this
            next!
          </Route>
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;
