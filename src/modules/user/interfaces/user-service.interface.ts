import { UserEntity } from '@project-modules/user';

export interface IUserService {
  findById(id: string): Promise<UserEntity | null>;
}
