import { useParams } from "react-router-dom";
import FeatureEditor from "../components/FeatureEditor";
import { useLiveGetSpecification } from "@/features/specifications/hooks/useLiveGetSpecification";

export const FeaturePage = () => {
  const { featureId } = useParams<{ featureId: string }>();
  const {
    data: specification,
    isLoading,
    isError,
  } = useLiveGetSpecification(featureId!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Loading feature...</p>
      </div>
    );
  }

  if (isError || !specification) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600">
          {isError ? "Something went wrong" : "Feature not found"}
        </p>
      </div>
    );
  }

  return <FeatureEditor specificationId={specification.id} />;
};
