import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from 'src/common/dto/create-register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Post()
  // @HttpCode(HttpStatus.CREATED) // 201 -> Created = user created (post request succeeded)
  // create(@Body() createUserDto: CreateUserDto): Promise<User> {
  //   return this.userService.create(createUserDto);
  // }

  @Get()
  @HttpCode(HttpStatus.OK) // 200 -> OK = get succeeded
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':uid')
  @HttpCode(HttpStatus.OK) // 200 -> OK = get succeeded
  findOne(@Param('uid') uid: string): Promise<User> {
    return this.userService.findOne(uid);
  }

  @Patch(':uid')
  @HttpCode(HttpStatus.OK) // 200 -> OK = update succeeded
  update(@Param('uid') uid: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.update(uid, updateUserDto);
  }

  @Delete(':uid')
  @HttpCode(HttpStatus.OK) // 200 -> OK = delete succeeded
  remove(@Param('uid') uid: string): Promise<void> {
    return this.userService.remove(uid);
  }
}
