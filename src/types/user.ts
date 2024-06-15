export interface UserPayload {
  id: number;
  role: string;
  user_type: string;
  sub: string;
  personalInfoStatus?: string;
  resumeStatus?: string;
}

export enum UserTypes {
  ISTEYIM = "ISTEYIM",
  INMIDI = "INMIDI",
  INMIDI_BACKOFFICE = "INMIDI_BACKOFFICE",
  ROLE_ADMIN = "ROLE_ADMIN",
  ROLE_INMIDI_BACKOFFICE_ADMIN = "ROLE_INMIDI_BACKOFFICE_ADMIN",
}

export enum UserRole {
  ROLE_ISTEYIM_LEVEL_1 = "ROLE_ISTEYIM_LEVEL_1",
  ROLE_ISTEYIM_LEVEL_2 = "ROLE_ISTEYIM_LEVEL_2",
  ROLE_ADMIN = "ROLE_ADMIN",
  ROLE_BACKOFFICE = "ROLE_BACKOFFICE",
  ROLE_INMIDI_BACKOFFICE_ADMIN = "ROLE_INMIDI_BACKOFFICE_ADMIN",
}
