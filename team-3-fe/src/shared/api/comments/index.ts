// src/shared/api/comments/index.ts
import { http } from '@/shared/api/http/client';
import { withUserHeaders } from '@/shared/api/http/headers';
import type { Comment, CommentCreateRequest } from './types';

// GET /api/v1/documents/{id}/comments
export const getComments = async (documentId: number, userId: number, roleId: number) => {
  const { data } = await http.get<Comment[]>(
    `/api/v1/documents/${documentId}/comments`,
    withUserHeaders(userId, roleId),
  );
  return data;
};

// POST /api/v1/documents/{id}/comments
export const addComment = async (
  documentId: number,
  body: CommentCreateRequest,
  userId: number,
  roleId: number,
) => {
  const { data } = await http.post<Comment>(
    `/api/v1/documents/${documentId}/comments`,
    body,
    withUserHeaders(userId, roleId),
  );
  return data;
};

// GET /api/v1/documents/{id}/comments/{comment_id}
export const getCommentById = async (
  documentId: number,
  commentId: number,
  userId: number,
  roleId: number,
) => {
  const { data } = await http.get<Comment>(
    `/api/v1/documents/${documentId}/comments/${commentId}`,
    withUserHeaders(userId, roleId),
  );
  return data;
};

export const deleteComment = async (
  documentId: number,
  commentId: number,
  userId: number,
  roleId: number,
) => {
  await http.delete(
    `/api/v1/documents/${documentId}/comments/${commentId}`,
    withUserHeaders(userId, roleId),
  );
};
