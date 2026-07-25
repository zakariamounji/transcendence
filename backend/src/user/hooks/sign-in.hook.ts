import { Injectable } from '@nestjs/common';
import {
  Hook,
  BeforeHook,
  type AuthHookContext,
} from '@thallesp/nestjs-better-auth';
import { UserService } from 'src/user/user.service';

@Hook()
@Injectable()
export class SignInHook {
  constructor(private readonly userService: UserService) {}

  @BeforeHook('/sign-out') // before, not after: the session is destroyed by sign-out, so the user id has to be read first.
  async handleOut(ctx: AuthHookContext) {
    const token = await ctx.getSignedCookie(
      ctx.context.authCookies.sessionToken.name,
      ctx.context.secret,
    );

    if (!token) return;

    const session = await ctx.context.internalAdapter.findSession(token);
    const id = session?.user?.id ?? session?.session?.userId;

    if (id) await this.userService.updateStatus(id, 'OFFLINE');
  }
}
