import { ISubscriptionEvent } from '../interfaces';

export const isSubscriptionEvent = (
  data: unknown,
): data is ISubscriptionEvent<string> => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return false;

  return 'eventType' in data && typeof data.eventType === 'string';
};
