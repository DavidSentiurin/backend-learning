import { Column, Entity, Index } from 'typeorm';

import { MyBaseEntity } from '../../../common/entities';

@Entity('refresh_tokens')
export class RefreshTokenEntity extends MyBaseEntity {
  @Index()
  @Column({ name: 'refresh_token' })
  refreshToken: string;
}