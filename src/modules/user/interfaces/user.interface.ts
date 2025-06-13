import { LanguagesEnum, RolesEnum } from '../../../common/enums';

export interface IUser {
  id: string;
  avatar?: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  language?: LanguagesEnum;
  isTermsConfirmed: boolean;
  roles: RolesEnum[];
}
