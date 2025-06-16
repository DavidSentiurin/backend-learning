import { JwtAuthGuard } from './jwt-auth.guard';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UserEntity } from '../../user/entities';
import { AuthSessionService } from '../services';

@Injectable()
export class AuthGuard extends JwtAuthGuard {
  constructor(private readonly authSessionService: AuthSessionService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await super.canActivate(context);

    if (!result) throw new UnauthorizedException();

    const request = context.switchToHttp().getRequest<{ user: UserEntity }>();
    const user = request.user;

    if (!user) throw new UnauthorizedException();

    const session = await this.authSessionService.get(user.id);

    if (!session) throw new UnauthorizedException();

    return true;
  }
}
