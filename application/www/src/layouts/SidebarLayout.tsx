import Navbar from "@/Navbar";
import { Outlet } from "react-router-dom";

export const SidebarLayout = () => {
  return (
    <div className="flex bg-white">
      <div className="sticky left-0 top-0 h-full z-10">
        <Navbar />
      </div>
      <div className="flex-1 px-8 py-12 w-full">
        <Outlet />
      </div>
    </div>
  );
};
