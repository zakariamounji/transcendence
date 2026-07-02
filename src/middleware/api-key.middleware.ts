import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // const apiKey = req.headers['x-api-key'];
  
    // if (apiKey !== 'my-secret-api-key') {
    //   throw new UnauthorizedException('Invalid API key');
    // }
    // i will set it again in the future but for now i will comment it out because i want to test the api without api key
    next();
  }
}
