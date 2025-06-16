import { IUserRemoveEvent } from '../interfaces';
import { USER_SUB_REMOVE_EVENT } from '../constants';
import { isSubscriptionEvent } from '../../../common/utils';

export const isUserRemoveEventData = (
  data: unknown,
): data is IUserRemoveEvent => {
  if (!isSubscriptionEvent(data)) return false;

  return (
    data.eventType === USER_SUB_REMOVE_EVENT &&
    'id' in data &&
    typeof data.id === 'string'
  );
};
