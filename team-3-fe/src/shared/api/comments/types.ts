export interface Comment {
  id: number;
  document_id: number;
  user_id: number;
  text: string;
  created_at: string;
  first_name: string;
  last_name: string;
  photo_path: string;
}
export interface DeleteCommentParams {
  documentId: number;
  commentId: number;
}
export interface CommentCreateRequest {
  text: string;
}
