export interface Specification {
  id: string;
  emoji?: string;
  name: string;
  summary?: string;
  content?: string;
  draft_content: string | null;
  date_published?: string;
  date_created: string;
  date_updated: string;
}

export interface ListSpecificationsResponse {
  data: Specification[];
}

export interface GetSpecificationResponse {
  data: Specification;
}

export interface CreateSpecificationRequest {
  name: string;
  emoji?: string;
}

export interface CreateSpecificationResponse {
  data: Specification;
}

export interface UpdateSpecificationResponse {
  data: Specification;
}
