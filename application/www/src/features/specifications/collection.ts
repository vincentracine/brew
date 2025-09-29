import { fetchClient } from "@/lib/fetchClient";
import type {
  CreateSpecificationResponse,
  ListSpecificationsResponse,
  Specification,
  UpdateSpecificationResponse,
} from "./dtos";
import { createCollection } from "@tanstack/react-db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { queryClient } from "@/lib/queryClient";

export const specificationCollection = createCollection(
  queryCollectionOptions({
    queryClient,
    queryKey: ["specifications"],
    queryFn: async () => {
      const response = await fetchClient.get<ListSpecificationsResponse>(
        "/features"
      );
      return response.data;
    },
    getKey: (item: Specification) => item.id,
    onInsert: async ({ transaction }) => {
      const { modified: newSpecification } = transaction.mutations[0];
      await fetchClient.post<CreateSpecificationResponse>(
        "/features",
        newSpecification
      );
    },
    onUpdate: async ({ transaction }) => {
      const { original, modified } = transaction.mutations[0];
      await fetchClient.put<UpdateSpecificationResponse>(
        `/features/${original.id}`,
        modified
      );
    },
    onDelete: async ({ transaction }) => {
      const { original } = transaction.mutations[0];
      await fetchClient.delete<void>(`/features/${original.id}`);
    },
  })
);
