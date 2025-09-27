import { useParams } from "react-router-dom";
import FeatureEditor from "../components/FeatureEditor";
import { useGetSpecification } from "@/features/specifications/queries";

export const FeaturePage = () => {
  const { featureId } = useParams<{ featureId: string }>();
  const {
    data: specification,
    isLoading,
    error,
  } = useGetSpecification(featureId!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Loading feature...</p>
      </div>
    );
  }

  if (error || !specification?.data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600">{error?.message || "Feature not found"}</p>
      </div>
    );
  }

  return <FeatureEditor specification={specification.data} />;
};
