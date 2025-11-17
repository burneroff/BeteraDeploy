export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  photoPath?: string;
  isVerified: boolean;
  documentsID?: string;
  role_id: number;
  role: string;
  created_at: string;
  changed_at: string;
  initials?: string;
}

export type CreateUserById = {
  first_name: string;
  last_name: string;
  email: string;
  role_id: number;
};

export type CreateUserByName = {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

export type CreateUserRequest = CreateUserById | CreateUserByName;

export interface CreateUserResponse {
  user: User & { role: string };
  verified: boolean;
  message: string;
}

export type UpdateProfilePayload = {
  user_id?: number | null;
  first_name?: string | null;
  last_name?: string | null;
  photo_path?: string | null;
};

export type PhotoUploadResp = { photo_path: string };
export type GenerateAvatarResp = { photo_path: string };
