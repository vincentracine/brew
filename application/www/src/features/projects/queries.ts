import { fetchClient } from "@/lib/fetchClient";
import type {
  GetProjectConfigResponse,
  UpdateProjectConfigResponse,
} from "./dtos";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ProjectConfig } from "./dtos";
import { queryClient } from "@/lib/queryClient";

export const useGetProjectConfig = () => {
  return useQuery({
    queryKey: ["projectConfig"],
    queryFn: async () => {
      return fetchClient.get<GetProjectConfigResponse>(`/project`);
    },
  });
};

export const useUpdateProjectConfig = () => {
  return useMutation({
    mutationFn: async (projectConfig: ProjectConfig) => {
      return fetchClient.put<UpdateProjectConfigResponse>(
        `/project`,
        projectConfig
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectConfig"] });
    },
  });
};
