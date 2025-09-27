import {
  PlusIcon,
  Cog6ToothIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  useListSpecifications,
  useCreateSpecification,
} from "@/features/specifications/queries";
import type { Specification } from "./features/specifications/dtos";

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
  specification: Specification;
  isActive: boolean;
}

const FeatureItem = ({ specification, isActive }: FeatureItemProps) => {
  const baseClasses =
    "flex flex-row gap-2 items-center px-3 py-2 pr-4 text-white hover:bg-zinc-800 rounded-full transition-colors";
  const activeClasses = isActive ? "bg-active" : "";
  const classes = `${baseClasses} ${activeClasses}`.trim();

  return (
    <Link to={`/features/${specification.id}`} className={classes}>
      <LightBulbIcon className="h-5 w-5" />
      <span className="font-medium truncate">{specification.name}</span>
    </Link>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: specifications } = useListSpecifications();
  const { mutateAsync: createSpecification, isPending: isCreating } =
    useCreateSpecification();

  const handleCreateFeature = async () => {
    if (isCreating) return;
    try {
      const { data: newSpecification } = await createSpecification({
        name: "Untitled feature",
      });
      navigate(`/features/${newSpecification.id}`);
    } catch (error) {
      console.error("Error creating feature:", error);
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
              label={isCreating ? "Creating..." : "New feature"}
              onClick={handleCreateFeature}
            />
            {specifications?.data?.map((specification) => {
              const isActive =
                location.pathname === `/features/${specification.id}`;
              return (
                <FeatureItem
                  key={specification.id}
                  specification={specification}
                  isActive={isActive}
                />
              );
            })}
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
