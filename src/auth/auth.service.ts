import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import * as bcrypt from 'bcrypt'; // hashing library for password hashing and comparison
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/common/dto/create-register.dto';
// import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    // constructor (private readonly userService: UserService) {}
    constructor (
        private readonly database: DatabaseService,
        private readonly jwtService: JwtService,
    ) {}

    async createUser (createUserDto: CreateUserDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        let user: User;
        try {
            user = await this.database.user.create({
                data: {
                    fullName: createUserDto.fullName,
                    email: createUserDto.email,
                    password: hashedPassword,
                }
            });
        } catch (error) {
            if (error.code === 'P2002') {
                // p2002 is a prisma error code that indicates a unique constraint violation, which means the email is already in use.
                throw new UnauthorizedException('Email already in use!');
            }
            throw new UnauthorizedException('Failed to create user!');
        }
        return user;
    }

    async validateUser (email: string, password: string): Promise<User> {
        const user = await this.database.user.findUnique({
            where: { email }
        });
        if (!user)
            throw new UnauthorizedException('Invalid credentials');
        const passwordMatch = await bcrypt.compare(password, user.password); // cause oasswords are stored hashed in the database, we need to compare the hashed password with the provided password
        if (!passwordMatch)
            throw new UnauthorizedException('Invalid credentials');
        return user;
    }


    async login (loginDto: LoginDto): Promise<{ access_token: string }> {
        const user = await this.validateUser(loginDto.email, loginDto.password);

        const payload = { email: user.email, sub: user.uid }; // payload for the JWT token

        return { access_token: this.jwtService.sign(payload) };
    }

    async register (createUserDto: CreateUserDto): Promise<{ access_token: string }> {

        const user = await this.createUser(createUserDto);
        const payload = { email: user.email, sub: user.uid }; // payload for the JWT token

        return { access_token: this.jwtService.sign(payload) };
    }
}
