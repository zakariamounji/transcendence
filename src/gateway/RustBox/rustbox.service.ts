import { Injectable } from "@nestjs/common";
import { Rustbox, RustboxTimeoutError, RustboxRateLimitError } from "rustbox";

@Injectable()
export class RustboxService {
  private client = new Rustbox(process.env["X-API-KEY"] || "");

async runSubmission(language: string, code: string, stdin?: string) {
    try {
      return await this.client.run({ language, code, stdin });
    } catch (e) {
      if (e instanceof RustboxTimeoutError) {
        return { verdict: 'TLE', stdout: '', stderr: 'Execution timed out' };
      }
      if (e instanceof RustboxRateLimitError) {
        throw new Error('Judge is rate limited, try again shortly');
      }
      throw e;
    }
  }
}