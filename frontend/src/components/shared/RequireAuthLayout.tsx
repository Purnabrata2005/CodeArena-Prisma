import { Outlet,Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";

export function RequireAuthLayout({ role }: { role?: "USER" | "ADMIN" }) {
  const { isAuthenticated, authUser, isFetchingUser } = useAuthStore();
  if (!authUser && isFetchingUser) {
    <div className="flex h-screen w-full justify-center text-center">
      <Loader2 className="mt-9 h-6 w-6 animate-spin" />
    </div>;
  }
  if (!isAuthenticated && !isFetchingUser) {
    return <Navigate to="/login" />;
  }

  if (role && authUser?.role !== role) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
}