export interface TokenPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  defaultCurrency: string | null;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

export interface ExtensionConnectionDto {
  id: string;
  label: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface ExtensionStatusResponse {
  connected: boolean;
  connections: ExtensionConnectionDto[];
}

export interface UpdateUserPreferencesDto {
  defaultCurrency?: string | null;
}
