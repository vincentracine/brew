import { fetchClient } from "@/lib/fetchClient";
import { useQuery } from "@tanstack/react-query";

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => fetchClient.get("/health"),
  });
};
