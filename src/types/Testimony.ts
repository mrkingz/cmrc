import IResource from './Resource';

export interface ITestimony extends IResource {
  testimony?: string;
  userId?: string;
  approved?: boolean;
}
