import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getBonjour(): string {
    return 'Hey Zakaria';
  }
  returnRequestBody(data: {email: string; user: string}): string {
    return data.email;
  }
}
