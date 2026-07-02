import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(
    context: ExecutionContext): boolean {
      const request = context.switchToHttp().getRequest();
      const role = request.headers['role'];
      if (role !== 'admin') {
        throw new UnauthorizedException('You do not have permission to access this resource');
      }
    return true;
  }
}
