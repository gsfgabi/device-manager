export interface Device {
  id: number;
  name: string;
  location: string;
  purchase_date: string;
  in_use: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface DeviceRequest {
  name: string;
  location: string;
  purchase_date: string;
}

export interface DeviceFilters {
  page?: number;
  per_page?: number;
  in_use?: boolean;
  location?: string;
  purchase_date_from?: string;
  purchase_date_to?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
  links: any[];
  path: string;
  first_page_url: string;
  last_page_url: string;
  next_page_url?: string;
  prev_page_url?: string;
}
