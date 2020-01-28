
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
  rememberMeToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
  resetStamp?: number;
  token?: string;
};

export interface Decoded {
  id: string,
  resetStamp: number,
  isAdmin: boolean,
  exp: number,
}

export interface Credentials {
  password: string;
  email: string;
}

export interface AuthResponse {
  token: string | null;
  message: string;
}

