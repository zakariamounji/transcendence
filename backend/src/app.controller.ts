import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('ping')
  getHello(): string {
    return 'ping';
  }

  @Post()
  createSomething(@Body() body: { email: string; user: string }, @Headers() headers: any): string {

    return this.appService.returnRequestBody(body);
  }
}
