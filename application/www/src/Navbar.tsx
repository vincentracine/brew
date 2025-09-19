import {
  PlusIcon,
  Cog6ToothIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Feature } from "@/lib/api";
import { useLocation } from "react-router-dom";

interface NavbarItemProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
}

const NavbarItem = ({
  icon: Icon,
  label,
  href,
  onClick,
  isActive = false,
}: NavbarItemProps) => {
  const baseClasses =
    "flex flex-row gap-2 items-center px-3 py-2 pr-4 text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer";
  const activeClasses = isActive ? "bg-active" : "";
  const classes = `${baseClasses} ${activeClasses}`.trim();

  if (onClick) {
    return (
      <button onClick={onClick} className={classes}>
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
      </button>
    );
  }

  return (
    <a href={href} className={classes}>
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </a>
  );
};

interface FeatureItemProps {
  feature: Feature;
  isActive: boolean;
}

const FeatureItem = ({ feature, isActive }: FeatureItemProps) => {
  const baseClasses =
    "flex flex-row gap-2 items-center px-3 py-2 pr-4 text-white hover:bg-zinc-800 rounded-full transition-colors";
  const activeClasses = isActive ? "bg-active" : "";
  const classes = `${baseClasses} ${activeClasses}`.trim();

  return (
    <a href={`/features/${feature.id}`} className={classes}>
      <LightBulbIcon className="h-5 w-5" />
      <span className="font-medium truncate">{feature.name}</span>
    </a>
  );
};

const Navbar = () => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const featuresData = await api.getFeatures();
        setFeatures(featuresData);
      } catch (error) {
        console.error("Error loading features:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeatures();
  }, []);

  const handleCreateFeature = async () => {
    if (creating) return;

    setCreating(true);
    try {
      const newFeature = await api.createFeature({ name: "Untitled feature" });
      setFeatures((prev) => [...prev, newFeature]);
      // Navigate to the new feature
      window.location.href = `/features/${newFeature.id}`;
    } catch (error) {
      console.error("Error creating feature:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="dark w-64 h-screen bg-zinc-950 text-white flex flex-col">
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
            <NavbarItem
              icon={PlusIcon}
              label={creating ? "Creating..." : "New feature"}
              onClick={handleCreateFeature}
            />
            {loading ? (
              <div className="px-3 py-2 text-zinc-400">Loading features...</div>
            ) : features.length > 0 ? (
              features.map((feature) => {
                const isActive =
                  location.pathname === `/features/${feature.id}`;
                return (
                  <FeatureItem
                    key={feature.id}
                    feature={feature}
                    isActive={isActive}
                  />
                );
              })
            ) : (
              <div className="px-3 py-2 text-zinc-400">No features yet</div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 items-start">
            <NavbarItem
              icon={Cog6ToothIcon}
              label="Settings"
              href="/settings"
              isActive={location.pathname === "/settings"}
            />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
