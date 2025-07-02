import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { MyBaseEntity } from '../../../common/entities';
import { UserEntity } from '../../user/entities';

@Entity('refresh_tokens')
export class RefreshTokenEntity extends MyBaseEntity {
  @Column({ name: 'refresh_token', update: false })
  refreshToken: string;

  @Column({ type: 'timestamp', name: 'expires_at', update: false })
  expiresAt: Date;

  @OneToOne(() => UserEntity)
  @JoinColumn({
    name: 'user_id',
  })
  user: UserEntity;
}
