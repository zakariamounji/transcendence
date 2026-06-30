import { Injectable } from "@nestjs/common";

@Injectable()
export class UserLogger {
    log(message: string) {
        console.log('[LOG]', message);
    }
}