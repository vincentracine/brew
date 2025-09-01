import {
  PlusIcon,
  Cog6ToothIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

interface NavbarItemProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
}

const NavbarItem = ({ icon: Icon, label, href }: NavbarItemProps) => (
  <a
    href={href}
    className="flex flex-row gap-2 items-center px-3 py-2 pr-4 text-white hover:bg-zinc-800 rounded-full transition-colors"
  >
    <Icon className="h-5 w-5" />
    <span className="font-medium">{label}</span>
  </a>
);

const Navbar = () => {
  return (
    <div className="w-64 h-full bg-zinc-950 text-white flex flex-col">
      {/* Fixed Header */}
      <div className="flex justify-center items-center py-4">
        <img src="/images/logo.png" alt="Brewing Logo" className="w-28" />
      </div>

      {/* Scrollable Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {/* Features Section */}
        <div className="flex flex-col gap-2">
          <h3 className="text-zinc-300 text-sm font-semibold uppercase px-2 py-1">
            Features
          </h3>
          <div className="flex flex-col gap-2 items-start">
            <NavbarItem icon={LightBulbIcon} label="Signup" href="/" />
            <NavbarItem icon={LightBulbIcon} label="Login" href="/" />
            <NavbarItem icon={LightBulbIcon} label="Manage TODOs" href="/" />
            <NavbarItem icon={PlusIcon} label="New feature" href="/" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-zinc-300 text-sm font-semibold uppercase px-2 py-1">
            Performance
          </h3>
          <div className="flex flex-col gap-2 items-start">
            <NavbarItem icon={PlusIcon} label="New requirement" href="/" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 items-start">
            <NavbarItem icon={Cog6ToothIcon} label="Settings" href="/" />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
