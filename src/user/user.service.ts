import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from 'src/database/database.service';
import { User } from '@prisma/client'

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {

      return await this.databaseService.user.create({
        data: {
          fullName: createUserDto.fullName,
          email: createUserDto.email,
          password: createUserDto.password,
        }
      });
    }
    catch (error) {
      if (error.code === 'P2002') {
        // p2002 is a prisma error code that indicates a unique constraint violation, which means the email is already in use.
        throw new ConflictException ('Email already in use!');
      }
      throw new BadRequestException ('Failed to create user!');
    }
  }


  async findAll(): Promise<User[]> {
    return await this.databaseService.user.findMany();
  }

  async findOne(uid: string): Promise<User> {
    const user =  await this.databaseService.user.findUnique({
      where: {uid}
    });
    if (!user)
        throw new NotFoundException ('User not found!');
    return user;
  }

  async update(uid: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(uid);
    
    return await this.databaseService.user.update({
      where: { uid },
      data: {
        fullName: updateUserDto.fullName,
        email:    updateUserDto.email,
        password: updateUserDto.password,
      }
    });
  }

  async remove(uid: string): Promise<void> {
    await this.findOne(uid);

    await this.databaseService.user.delete({
      where: { uid },
    });
  }
}
