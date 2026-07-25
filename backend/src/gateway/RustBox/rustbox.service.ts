import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Language } from '@prisma/client';
import { Rustbox, RustboxTimeoutError, RustboxRateLimitError } from 'rustbox';

// the judge only ever runs the languages the platform offers
const SUPPORTED_LANGUAGES: string[] = Object.values(Language);

export interface SubmissionResult {
  verdict?: string | null;
  stdout?: string | null;
  stderr?: string | null;
  cause?: string | null;
  error_message?: string | null;
  statusCode?: number | null;
}

@Injectable()
export class RustboxService {
  private readonly client: Rustbox | null;

  constructor() {
    const apiKey = process.env.RUSTBOX_API_KEY;
    // A missing key must not stop the platform from booting: only judging is unavailable.
    this.client = apiKey ? new Rustbox(apiKey) : null;
  }

  async runSubmission(
    language: string,
    code: string,
    stdin?: string,
  ): Promise<SubmissionResult> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'RUSTBOX_API_KEY is not configured, submissions cannot be judged',
      );
    }
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      throw new BadRequestException(`Unsupported language: ${language}`);
    }

    try {
      const raw = await this.client.run({ language, code, stdin });
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
        return { verdict: 'TLE', stdout: '', stderr: 'Execution timed out' };
      }
      if (e instanceof RustboxRateLimitError) {
        throw new ServiceUnavailableException(
          'Judge is rate limited, try again shortly',
        );
      }
      throw e;
    }
  }
}
