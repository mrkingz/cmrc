
export interface IUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  photo?: string | null;
  passwordReset?: boolean;
  rememberMeToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

