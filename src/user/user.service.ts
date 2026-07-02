import { Injectable, NotFoundException } from '@nestjs/common';
import { UserLogger } from './user.logger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { prisma } from 'lib/prisma';

export interface User {
    id: number;
    name: string;
    email: string
}


@Injectable()
export class UserService {
    constructor(private readonly userLogger: UserLogger) {}

    
    private users: User[] = [
        {id: 1, name: 'John Doe', email: 'john.doe@example.com'},
        {id: 2, name: 'Jane Smith', email: 'jane.smith@example.com'}
    ];

    // find all users or filter by name
    getUsers(n?: string): User[] {
        if (n) {
            this.userLogger.log('Fetching users with name: ' + n);
            return this.users.filter(user => user.name === n);
        } else {
            this.userLogger.log('Fetching all users');
            return this.users;
        }
    }

    //find a user by id
    findOneUser (id: number): User{
        this.userLogger.log('Fetching user with id: ' + id);
        const user = this.users.find(user => user.id === id);
        if (!user)
            throw new NotFoundException('user not found');
        return user;
    }

    // create a new user
    createUser(dto: CreateUserDto): User {
        const newUser: User = { id: this.users.length + 1, name: dto.name, email: dto.email };
        this.users.push(newUser);
        this.userLogger.log('Created new user: ' + JSON.stringify(newUser));
        return newUser;
    }

    updateUser(id: string, dto: UpdateUserDto): User | undefined {
        const user = this.findOneUser(Number(id));
        if (user) {
            user.name = dto.name ?? user.name;
            user.email = dto.email ?? user.email;
            this.userLogger.log('Updated user: ' + JSON.stringify(user));
            return user;
        }
        this.userLogger.log('User with id ' + id + ' not found for update');
        return undefined;
    }
}
