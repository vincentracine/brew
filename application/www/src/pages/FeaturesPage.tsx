import { useListSpecifications } from "@/features/specifications/queries";
import { Navigate } from "react-router-dom";

export const FeaturesPage = () => {
  const { data: features } = useListSpecifications();
  if (features?.data && features.data.length > 0) {
    return <Navigate to={`/features/${features.data[0].id}`} />;
  }
  return null;
};
