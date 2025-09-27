export interface ProjectConfig {
  id: string;
  onboarded: boolean;
  name: string;
}

export interface GetProjectConfigResponse {
  data: ProjectConfig;
}

export interface UpdateProjectConfigRequest {
  name: string;
  onboarded: boolean;
}

export interface UpdateProjectConfigResponse {
  data: ProjectConfig;
}
