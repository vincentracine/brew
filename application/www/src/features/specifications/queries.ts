import { fetchClient } from "@/lib/fetchClient";
import { queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  type Specification,
  type ListSpecificationsResponse,
  type GetSpecificationResponse,
  type CreateSpecificationResponse,
  type UpdateSpecificationResponse,
  type CreateSpecificationRequest,
} from "./dtos";

export const useListSpecifications = () => {
  return useQuery({
    queryKey: ["specifications"],
    queryFn: async () => {
      return fetchClient.get<ListSpecificationsResponse>("/features");
    },
  });
};

export const useGetSpecification = (uuid: string) => {
  return useQuery({
    queryKey: ["specifications", uuid],
    queryFn: async () => {
      return fetchClient.get<GetSpecificationResponse>(`/features/${uuid}`);
    },
  });
};

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
        (previous: ListSpecificationsResponse): ListSpecificationsResponse => {
          return {
            data: [...previous.data, response.data],
          };
        }
      );
    },
  });
};

export const useUpdateSpecification = () => {
  return useMutation({
    mutationFn: async (specification: Specification) => {
      return fetchClient.put<UpdateSpecificationResponse>(
        `/features/${specification.id}`,
        specification
      );
    },
    onSuccess: (response: UpdateSpecificationResponse) => {
      const { data } = response;
      queryClient.setQueryData(["specifications", data.id], { data });
      queryClient.setQueryData(
        ["specifications"],
        (previous: ListSpecificationsResponse): ListSpecificationsResponse => {
          return {
            data: previous.data.map((entry) =>
              data.id === entry.id ? data : entry
            ),
          };
        }
      );
    },
  });
};
