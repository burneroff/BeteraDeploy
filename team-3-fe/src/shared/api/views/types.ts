export interface ViewResponse {
  status: 'viewed' | string;
  message?: string;
}

export interface ViewsCount {
  views_count: number;
}
export interface ViewPost {
  documentId: number;
}
export interface Viewer {
  id: number;
  first_name: string;
  last_name: string;
  photo_path?: string;
  viewed_at: string; // ISO
  role_id: number;
  role_name: string;
}
