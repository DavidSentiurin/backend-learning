import { InternalServerErrorException } from '@nestjs/common';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
} from 'typeorm';

import { UserEntity } from '../entities';
import { AuthService } from '../../auth/services';
import { isUserRemoveEventData } from '../utils';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  constructor(
    dataSource: DataSource,
    private readonly authService: AuthService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return UserEntity;
  }

  async beforeRemove(event: RemoveEvent<UserEntity>) {
    const { data } = event.queryRunner;

    if (!isUserRemoveEventData(data))
      throw new InternalServerErrorException(['Subscriber not registered']);

    await this.authService.logout(data.id);
  }
}
