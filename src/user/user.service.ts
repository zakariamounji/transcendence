import { Injectable, NotFoundException } from '@nestjs/common';
import { UserLogger } from './user.logger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
// import { PrismaClient } from '@prisma/client'
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

// import { PrismaService } from './prisma.service';
// import { User, Prisma } from 'generated/prisma';

// const prisma = new PrismaClient();

// export interface User {
//     id: number;
//     name: string;
//     email: string
// }


@Injectable()
export class UserService {
    constructor(private readonly userLogger: UserLogger, private readonly databaseService: DatabaseService) {}
    // private users: User[] = [
    //     {id: 1, name: 'John Doe', email: 'john.doe@example.com'},
    //     {id: 2, name: 'Jane Smith', email: 'jane.smith@example.com'}
    // ];

    // find all users or filter by name
    async getUsers (n?: string): Promise<User[]> {
        if (n) {
            this.userLogger.log('Fetching users with name: ' + n);
            return await this.databaseService.user.findMany({
                where: {
                    fullName: {
                        contains: n,
                        mode: 'insensitive'
                    }
                }
            });
        } else {
            this.userLogger.log('Fetching all users');
            return await this.databaseService.user.findMany()
        }
    }

    //find a user by id
    async findOneUser (id: string): Promise<User>{
        this.userLogger.log('Fetching user with id: ' + id);
        const user = await this.databaseService.user.findUnique({
            where: { uid: id }
        });
        if (!user)
            throw new NotFoundException('user not found');
        return user;
    }

    // create a new user
    async createUser(dto: CreateUserDto): Promise<User> {
        const newUser = await this.databaseService.user.create({
            data: {
                fullName: dto.name,
                email: dto.email,
                password: dto.password
            }
        });
        this.userLogger.log('Created new user: ' + JSON.stringify(newUser));
        return newUser;
    }

    async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
        const user = await this.findOneUser(id);
        if (user) {
            await this.databaseService.user.update({
                where: { uid: id },
                data: {
                    fullName: dto.name ?? undefined,
                    email: dto.email ?? undefined,
                    password: dto.password ?? undefined
                }
            });
            this.userLogger.log('Updated user: ' + JSON.stringify(user));
            return user;
        }
        this.userLogger.log('User with id ' + id + ' not found for update');
        throw new NotFoundException('user not found');
    }
}
