export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  verificationCode?: string;
  isVerified: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}