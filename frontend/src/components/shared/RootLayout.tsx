import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="flex min-h-screen flex-col w-full">
      <div className="flex-1">
        <Navbar>
          <div className="mb-4 pt-8 md:pt-12">
            <Outlet />
          </div>
        </Navbar>
      </div>
      <Footer />
    </div>
  );
};

export default RootLayout;
