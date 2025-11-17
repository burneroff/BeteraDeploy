
export interface LikeResponse {
  status: 'liked' | string;
  message?: string;
}

export interface LikesCount {
  likes_count: number;
  document_id: number;
}
