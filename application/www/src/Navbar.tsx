import { PlusIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { type ComponentType, type SVGProps } from "react";
import { IconTrash } from "@tabler/icons-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  useListSpecifications,
  useCreateSpecification,
  useDeleteSpecification,
} from "@/features/specifications/queries";
import type { Specification } from "./features/specifications/dtos";
import { IconPicker } from "./features/specifications/components/IconPicker";

type NavbarItemProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  isActive?: boolean;
} & ({ onClick: () => void } | { href: string });

const NavbarItem = ({
  icon: Icon,
  label,
  isActive = false,
  ...props
}: NavbarItemProps) => {
  const baseClasses =
    "flex flex-row gap-2 items-center px-3 py-2 pr-4 text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer";
  const activeClasses = isActive ? "bg-active" : "";
  const classes = `${baseClasses} ${activeClasses}`.trim();

  if ("onClick" in props) {
    const { onClick } = props;
    return (
      <button onClick={onClick} className={classes}>
        <Icon className="h-5 w-5" />
        <span className="font-medium">{label}</span>
      </button>
    );
  }

  return (
    <Link to={props.href} className={classes}>
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </Link>
  );
};

interface FeatureItemProps {
  specification: Specification;
  isActive: boolean;
}

const FeatureItem = ({ specification, isActive }: FeatureItemProps) => {
  const baseClasses =
    "flex flex-row w-full gap-2 items-center px-2 py-2 pr-2 text-white hover:bg-zinc-800 rounded-full transition-colors hover:[&_.trash-icon]:block";
  const activeClasses = isActive ? "bg-active" : "";
  const classes = `${baseClasses} ${activeClasses}`.trim();
  const navigate = useNavigate();
  const { mutateAsync: deleteSpecification } = useDeleteSpecification();

  const handleDeleteFeature = async () => {
    await deleteSpecification(specification.id);
    navigate("/features");
  };
  return (
    <Link to={`/features/${specification.id}`} className={classes}>
      <div className="h-8 w-8 text-base rounded-full hover:bg-active flex items-center justify-center">
        <IconPicker specificationId={specification.id} />
      </div>
      <span className="font-medium truncate flex-grow-1">
        {specification.name}
      </span>
      <div className="h-8 w-8 text-base rounded-full hover:bg-active flex items-center justify-center">
        <IconTrash
          className="trash-icon h-5 w-5 hidden flex-shrink-0"
          onClick={handleDeleteFeature}
        />
      </div>
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
        emoji: "💡",
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
