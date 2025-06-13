import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent, RemoveEvent,
} from 'typeorm';
import { UserEntity } from '../entities';
import { SessionService } from '../../session/session.service';

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<UserEntity> {
  constructor(dataSource: DataSource, private readonly sessionService: SessionService) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return UserEntity;
  }

  afterRemove(event: RemoveEvent<UserEntity>) {
    console.log('event', event);

    // this.sessionService.delete(event.entity?.id);
    console.log(`BEFORE USER INSERTED: `, event.entity);
  }
}