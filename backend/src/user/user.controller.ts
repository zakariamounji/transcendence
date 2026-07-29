import { Body, Controller, ForbiddenException, Get, Param, Patch, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard, Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { UpdateProfileDto } from './dto/updateProfile.dto'
import { UserRole } from '@prisma/client';
import { stat } from 'fs';
import { UserStatus } from '@prisma/client';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('me')
    getMe(@Session() session: UserSession) {
        return this.userService.findUserById(session.user.id);
    }

    @Get ('all')
    getAllUsers() {
        return this.userService.findAllUsers();
    }

    // @Get (':userId')
    // getUser(@Param('userId') userId: string) {
    //     return this.userService.findUserById(userId);
    // }

    // @Get()
    // getUser(@Session() session: UserSession) {
    //     return this.userService.findUserById(session.user.id);
    // }

    @Post('adminRole')
    updateAdminRole(@Session() session: UserSession, @Body('userId') userId: string) {
        if (session.user.role !== 'ADMIN') {
            throw new ForbiddenException("Only admins can update roles");
        }
        return this.userService.updateRole(userId, { role: 'ADMIN' });
    }

    @Post('me')
    updateUser(@Session() session: UserSession, @Body() dto: UpdateProfileDto) {
        return this.userService.updateProfile(session.user.id, dto);
    }

    @Post('status')
    updateStatus(@Session() session: UserSession, @Body('status') status: "ONLINE" | "OFFLINE" | "IN_BATTLE") {
        return this.userService.updateStatusFront(session.user.id, status);
    }

    @Patch('battleResult')
    updateBattleResult(@Session() session: UserSession, @Body('won') won: boolean, @Body('expGained') expGained: number) {
        return this.userService.applyBattleResult(session.user.id, won, expGained);
    }
}
