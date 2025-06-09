import { UserEntity } from '../entities';

export interface IUserService {
  findById(id: string): Promise<UserEntity | null>;
}
