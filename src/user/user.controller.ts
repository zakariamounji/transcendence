// import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
// import { UserService } from './user.service';
// import { AuthGuard, Session, type UserSession } from '@thallesp/nestjs-better-auth';

// @Controller('user')
// @UseGuards(AuthGuard)
// export class UserController {
//     constructor(private readonly userService: UserService) {}

//     @Get('user')
//     getUser(@Session() session: UserSession) {
//         return this.userService.findUserById(session.user.id);
//     }

//     @Patch('user')
//     updateUser(@Session() session: UserSession, dto: UpdateProfileDto) {
//         return this.userService.updateProfile(session.user.id, dto);
//     }
// }
