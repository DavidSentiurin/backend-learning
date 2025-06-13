import { JwtAuthGuard } from './jwt-auth.guard';
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SessionService } from '../../session/session.service';
import { UserEntity } from '../../user/entities';
import { AuthUtil } from '../utils';

@Injectable()
export class AuthGuard extends JwtAuthGuard {
  constructor(
    private readonly sessionService: SessionService,
    private authUtil: AuthUtil,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = await super.canActivate(context);

    if (!result) throw new UnauthorizedException();

    const request = context.switchToHttp().getRequest<{ user: UserEntity }>();
    const user = request.user;

    if (!user) throw new UnauthorizedException();

    const authSessionKey = this.authUtil.getAuthSessionKey(user.id);
    const hasSession = await this.sessionService.get(authSessionKey);

    if (!hasSession) throw new UnauthorizedException();

    return true;
  }
}
