export interface User {
  id: number;
  email: string;
  password: string;
  verificationCode?: string;
  isVerified: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}