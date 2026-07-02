import { Controller, Get, Post, Put, Query, Body, Param, ParseIntPipe, UseGuards} from '@nestjs/common';
import { UserService } from './user.service';
import type { User } from './user.service'
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleGuard } from 'src/guards/role.guard';

@Controller('user')
export class UserController {
    // private readonly userService: UserService;
    // constructor(test: UserService) {
    //     this.userService = test;
    // }
    constructor(private readonly userService: UserService) {} // does the same as the above commented code, but shorter and cleaner

    @Get()
    getUsers(@Query('name') name: string): { id: number; name: string }[] {
        return this.userService.getUsers(name);
    }

    @Get(':id')
    findOneUser(@Param('id', ParseIntPipe) id: number): User{
        return this.userService.findOneUser(id);
    }

    @Post()
    createUser(@Body() dto: CreateUserDto): User {
        return this.userService.createUser(dto);
    }

    @Put(':id')
    // @UseGuards(RoleGuard) // hna kan3iyt l guard li kay checki role dyal user
    updateUser (@Param('id') id: string, @Body() dto: UpdateUserDto): User | undefined {
        return this.userService.updateUser(id, dto);
    }
}
