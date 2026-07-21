import { Injectable } from "@nestjs/common";
import { Rustbox, RustboxTimeoutError, RustboxRateLimitError } from "rustbox";

@Injectable()
export class RustboxService {
  private client = new Rustbox(process.env["X-API-KEY"] || "");

async runSubmission(language: string, code: string, stdin?: string) {
    try {
      const raw = await this.client.run({ language, code, stdin });
      return {
        verdict: raw.result?.verdict,
        stdout: raw.output?.stdout,
        stderr: raw.output?.stderr,
        cause: raw.result?.cause,
        error_message: raw.result?.error_message,
        statusCode: raw.result?.exit_code,
      }
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