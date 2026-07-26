import { Injectable, Logger } from "@nestjs/common";
import { Rustbox, RustboxTimeoutError, RustboxRateLimitError } from "rustbox";

@Injectable()
export class RustboxService {
  private readonly logger = new Logger(RustboxService.name);
  private client: Rustbox | null = null;

  private getClient(): Rustbox | null {
    const apiKey = process.env["X-API-KEY"]?.trim();

    if (!apiKey) {
      this.logger.warn("X-API-KEY is not configured. Code execution is disabled.");
      return null;
    }

    if (!this.client) {
      this.client = new Rustbox(apiKey);
    }

    return this.client;
  }

  async runSubmission(language: string, code: string, stdin?: string) {
    const client = this.getClient();

    if (!client) {
      return {
        verdict: "SKIPPED",
        stdout: "",
        stderr: "Code execution is unavailable because X-API-KEY is not configured.",
        cause: "",
        error_message: "Missing X-API-KEY",
        statusCode: 0,
      };
    }

    try {
      const raw = await client.run({ language, code, stdin });
      return {
        verdict: raw.result?.verdict,
        stdout: raw.output?.stdout,
        stderr: raw.output?.stderr,
        cause: raw.result?.cause,
        error_message: raw.result?.error_message,
        statusCode: raw.result?.exit_code,
      };
    } catch (e) {
      if (e instanceof RustboxTimeoutError) {
        return { verdict: "TLE", stdout: "", stderr: "Execution timed out" };
      }
      if (e instanceof RustboxRateLimitError) {
        throw new Error("Judge is rate limited, try again shortly");
      }
      throw e;
    }
  }
}