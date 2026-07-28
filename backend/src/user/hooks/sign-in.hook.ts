import { Injectable } from "@nestjs/common";
import { Hook, AfterHook, BeforeHook, type AuthHookContext } from "@thallesp/nestjs-better-auth";
import { UserService } from "src/user/user.service";

@Hook()
@Injectable()
export class SignInHook {
  constructor(private readonly userService: UserService) {}

  // @AfterHook("/sign-in/email")
  // async handle(ctx: AuthHookContext) {
  //   const id = ctx.context.newSession?.user?.id;
  //   if (id) await this.userService.updateStatus(id, "ONLINE");
  // }

  // if our implementation supports login in by default after regestering, we need another hool with path : "/sign-up/email"

  @BeforeHook("/sign-out") // why before hook? because the session is destroyed after the sign-out, so we need to get the user id before that.
  async handleOut(ctx: AuthHookContext) {
    const token = await ctx.getSignedCookie(
      ctx.context.authCookies.sessionToken.name,
      ctx.context.secret,
    );

    if (!token) return;

    const session = await ctx.context.internalAdapter.findSession(token);
    const id = session?.user?.id ?? session?.session?.userId;

    if (id) await this.userService.updateStatus(id, "OFFLINE");
  }

  // a hook to update the role of user to admin only if his email is test@gmail.com, on sign-up and social providers.
  @AfterHook("/sign-in/social")
  async handleSignUp(ctx: AuthHookContext) {
    const id = ctx.context.newSession?.user?.id;
    const email = ctx.context.newSession?.user?.email;
    const role = ctx.context.newSession?.user?.role;
    const provider = ctx.context.newSession?.user?.provider;

    if (provider !== "42-school")
      return;

    const adminEmails = [
      "abifkirn@student.1337.ma",
      "bnafiai@student.1337.ma",
      "zmounji@student.1337.ma",
      "abdael-m@student.1337.ma",
    ];

    if (id && adminEmails.includes(email) && role !== "ADMIN") {
      await this.userService.updateRole(id, { role: "ADMIN" });
    }
  }
}