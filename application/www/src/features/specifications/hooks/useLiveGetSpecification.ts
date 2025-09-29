import { useLiveQuery, eq } from "@tanstack/react-db";
import { specificationCollection } from "../collection";

export const useLiveGetSpecification = (uuid: string) => {
  const result = useLiveQuery(
    (q) =>
      q
        .from({ specifications: specificationCollection })
        .where(({ specifications }) => eq(specifications.id, uuid))
        .orderBy(({ specifications }) => specifications.date_created, "desc")
        .limit(1),
    [uuid]
  );
  return {
    ...result,
    data: result.data?.[0],
  };
};
