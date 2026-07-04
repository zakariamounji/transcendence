import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/common/dto/create-register.dto';

@Controller('auth')
export class AuthController {
    constructor (private readonly authService: AuthService) {}

    @Post('login')
    @HttpCode(200) // 200 -> OK = login succeeded
    login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
        return this.authService.login(loginDto);
    }

    @Post('register')
    @HttpCode(201) // 201 -> Created = registration succeeded
    register(@Body() createUserDto: CreateUserDto): Promise<{ access_token: string }> {
        return this.authService.register(createUserDto);
    }
}