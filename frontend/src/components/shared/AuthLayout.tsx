import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import TextAnimationHeading from "@/components/landing/TextAnimationHeading";
import { Outlet } from "react-router-dom";
import { Navigate } from "react-router-dom";



const AuthLayout = () => {
  const isAuthenticated = false;

  return (
    <>
      {isAuthenticated ? (
        <Navigate to="/" />
      ) : (
        <div className="min-h-screen flex">
      {/* Left Panel - Persistent Branding */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-accent/10 relative flex-col justify-between p-10"
      >
        <div className="h-12 w-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
          <Code2 className="h-6 w-6 text-accent" />
        </div>

        <div className="space-y-4">
          <h2 className="text-4xl xl:text-5xl font-bold text-foreground leading-tight">
            <TextAnimationHeading className="mx-0 flex-row lg:gap-1" />
            
          </h2>
          <p className="text-muted-foreground text-lg max-w-md">
            Continue your journey mastering Data Structures & Algorithms on LeetLab.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 LeetLab. All rights reserved.</p>
      </motion.div>

      {/* Right Panel - Dynamic Content */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-background">
        <Outlet />
      </div>
    </div>     
      )}
    </>
  );
};

export default AuthLayout;