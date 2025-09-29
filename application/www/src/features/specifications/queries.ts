import { fetchClient } from "@/lib/fetchClient";
import { queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import {
  type Specification,
  type CreateSpecificationResponse,
  type CreateSpecificationRequest,
} from "./dtos";

export const useCreateSpecification = () => {
  return useMutation({
    mutationFn: async (requestBody: CreateSpecificationRequest) => {
      return fetchClient.post<CreateSpecificationResponse>(
        "/features",
        requestBody
      );
    },
    onSuccess: (response: CreateSpecificationResponse) => {
      queryClient.setQueryData(
        ["specifications"],
        (previous: Specification[]): Specification[] => {
          return [...previous, response.data];
        }
      );
    },
  });
};

export const useDeleteSpecification = () => {
  return useMutation({
    mutationFn: async (uuid: string) => {
      return fetchClient.delete<void>(`/features/${uuid}`);
    },
    onSuccess: (_, uuid: string) => {
      queryClient.removeQueries({ queryKey: ["specifications", uuid] });
      queryClient.setQueryData(
        ["specifications"],
        (previous: Specification[]): Specification[] => {
          return previous.filter((entry) => entry.id !== uuid);
        }
      );
    },
  });
};
