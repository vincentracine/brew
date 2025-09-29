import { specificationCollection } from "@/features/specifications/collection";
import { useLiveQuery } from "@tanstack/react-db";
import { Navigate } from "react-router-dom";

export const FeaturesPage = () => {
  const { data: specifications } = useLiveQuery(
    (q) =>
      q
        .from({ specifications: specificationCollection })
        .orderBy(({ specifications }) => specifications.date_created, "asc")
        .limit(1),
    []
  );
  if (specifications.length > 0) {
    return <Navigate to={`/features/${specifications[0].id}`} />;
  }
  return null;
};
