import Footer from "@/components/landing/Footer";
import Navbar from "@/components/landing/Navbar";
import { Outlet } from "react-router-dom";

const RootLayout = () => {
  return (
    <div className="h-full w-full p-2">
      <Navbar>
        <div className="mb-4 pt-4 md:pt-4">
          <Outlet />
        </div>
      </Navbar>
      <Footer />
    </div>
  );
};

export default RootLayout;
