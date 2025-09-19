// API Configuration
export const API_BASE_URL = "http://localhost:9680";

// Types
export interface ProjectConfig {
  id: string;
  onboarded: boolean;
  name: string;
}

export interface ProjectUpdate {
  onboarded: boolean;
  name?: string;
}

export interface Feature {
  id: string;
  name: string;
  summary?: string;
  content?: string;
  draft_content?: string;
  date_published?: string;
  date_created: string;
  date_updated: string;
}

export interface FeatureCreate {
  name: string;
}

export interface FeatureUpdate {
  name?: string;
  summary?: string;
  content?: string;
  draft_content?: string;
}

// API Functions
export const api = {
  // Project Configuration
  async getProject(): Promise<ProjectConfig> {
    const response = await fetch(`${API_BASE_URL}/project`);
    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.statusText}`);
    }
    return response.json();
  },

  async updateProject(update: ProjectUpdate): Promise<ProjectConfig> {
    const response = await fetch(`${API_BASE_URL}/project`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(update),
    });
    if (!response.ok) {
      throw new Error(`Failed to update project: ${response.statusText}`);
    }
    return response.json();
  },

  // Features
  async getFeatures(): Promise<Feature[]> {
    const response = await fetch(`${API_BASE_URL}/features`);
    if (!response.ok) {
      throw new Error(`Failed to fetch features: ${response.statusText}`);
    }
    return response.json();
  },

  async createFeature(feature: FeatureCreate): Promise<Feature> {
    const response = await fetch(`${API_BASE_URL}/features`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feature),
    });
    if (!response.ok) {
      throw new Error(`Failed to create feature: ${response.statusText}`);
    }
    return response.json();
  },

  async getFeature(id: string): Promise<Feature> {
    const response = await fetch(`${API_BASE_URL}/features/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch feature: ${response.statusText}`);
    }
    return response.json();
  },

  async updateFeature(id: string, update: FeatureUpdate): Promise<Feature> {
    const response = await fetch(`${API_BASE_URL}/features/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(update),
    });
    if (!response.ok) {
      throw new Error(`Failed to update feature: ${response.statusText}`);
    }
    return response.json();
  },

  async deleteFeature(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/features/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`Failed to delete feature: ${response.statusText}`);
    }
  },

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }
    return response.json();
  },
};
