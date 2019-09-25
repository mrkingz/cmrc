import { Timestamp } from "typeorm";

export default interface UserInterface {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  photo?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
};