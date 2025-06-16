import { UserEntity } from '../entities';
import { USER_SUB_REMOVE_EVENT } from '../constants';
import { ISubscriptionEvent } from '../../../common/interfaces';

export interface IUserRemoveEvent
  extends ISubscriptionEvent<typeof USER_SUB_REMOVE_EVENT> {
  id: UserEntity['id'];
}
