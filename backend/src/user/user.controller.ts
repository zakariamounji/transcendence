import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import {
  AuthGuard,
  Session,
  type UserSession,
} from '@thallesp/nestjs-better-auth';
import { UpdateProfileDto } from './dto/updateProfile.dto';
import { UserStatus } from '@prisma/client';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getMe(@Session() session: UserSession) {
    return this.userService.findUserById(session.user.id);
  }

  @Get('all')
  getAllUsers() {
    return this.userService.findAllUsers();
  }

  @Patch('me')
  updateUser(@Session() session: UserSession, @Body() dto: UpdateProfileDto) {
    return this.userService.updateProfile(session.user.id, dto);
  }

  @Post('status')
  updateStatus(
    @Session() session: UserSession,
    @Body('status') status: UserStatus,
  ) {
    return this.userService.updateStatusFront(session.user.id, status);
  }
}
