*player win -> +6xp
*player lose -> +0xp







bach nrja3 lih
[
import { 
    Injectable, 
    UnsupportedMediaTypeException, 
    NotFoundException, 
    ForbiddenException, 
    InternalServerErrorException 
} from '@nestjs/common';
import { BattleService } from 'src/battle/battle.service';
import { exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface ExecutionResult {
    success: boolean;
    output: string;
    error?: string;
}

@Injectable()
export class GatewayService {
    constructor(private readonly battleService: BattleService) {}

    async executeCode(userId: string, battleId: string, code: string) {
        const battle = await this.battleService.findBattleOrThrow(battleId);
        
        if (!battle) {
            throw new NotFoundException(`Battle ${battleId} not found`);
        }
        if (!battle.players.some(player => player.id === userId)) {
            throw new ForbiddenException(`User ${userId} is not part of battle ${battleId}`);
        }

        let result: ExecutionResult;

        if (battle.challenge.language === 'C') {
            result = await this.executeCCcode(code);
        } else if (battle.challenge.language === 'CPP') {
            result = await this.executeCPPCode(code);
        } else {
            throw new UnsupportedMediaTypeException(`Unsupported language: ${battle.challenge.language}`);
        }

        return result;
    }

    private async executeCCcode(code: string): Promise<ExecutionResult> {
        return this.runInDockerSandbox(code, 'c', 'gcc /app/code.c -o /app/exec && /app/exec');
    }
    
    private async executeCPPCode(code: string): Promise<ExecutionResult> {
        return this.runInDockerSandbox(code, 'cpp', 'g++ /app/code.cpp -o /app/exec && /app/exec');
    }

    private async runInDockerSandbox(
        code: string, 
        extension: 'c' | 'cpp', 
        containerCommand: string
    ): Promise<ExecutionResult> {
        const uniqueId = crypto.randomUUID();
        const baseTempDir = os.tmpdir();
        
        // Create a unique temporary folder for this specific run
        const runFolder = path.join(baseTempDir, `sandbox_${uniqueId}`);
        const sourcePath = path.join(runFolder, `code.${extension}`);

        try {
            // 1. Create the temporary directory and write the user's code file
            await fs.mkdir(runFolder, { recursive: true });
            await fs.writeFile(sourcePath, code);

            /**
             * 2. Build the Docker sandbox command.
             * 
             * Safety options used:
             * --rm              Automatically delete the container after it finishes.
             * --network none    Disable internet access completely.
             * --memory="128m"   Cap RAM usage at 128 megabytes (prevents RAM exhaustion).
             * --cpus="0.5"      Cap CPU usage to half a core (prevents CPU freezing).
             * -v "folder:/app"  Mount only the temporary folder so the container has 
             *                   zero access to the rest of your server's filesystem.
             */
            const dockerCommand = [
                'docker run',
                '--rm',
                '--network none',
                '--memory="128m"',
                '--cpus="0.5"',
                `-v "${runFolder}:/app"`,
                'gcc:11-slim', // A lightweight official image containing gcc/g++
                `sh -c "${containerCommand}"`
            ].join(' ');

            // 3. Execute compilation and run inside Docker (timeout at 10 seconds total)
            const { stdout, stderr } = await execPromise(dockerCommand, { timeout: 10000 });

            return {
                success: true,
                output: stdout.trim(),
                error: stderr.trim() || undefined,
            };

        } catch (err: any) {
            // Handle timeouts or system command execution failures
            if (err.killed) {
                return {
                    success: false,
                    output: 'Time Limit Exceeded',
                    error: 'Your code took too long to compile or run (max 10s).',
                };
            }

            // If compile/runtime fails inside the docker container, Docker returns standard error output
            return {
                success: false,
                output: 'Execution Failed',
                error: err.stderr || err.message,
            };
        } finally {
            // 4. Always clean up the temporary directory and files
            try {
                await fs.rm(runFolder, { recursive: true, force: true }).catch(() => {});
            } catch (cleanupErr) {
                // Silently ignore cleanup errors
            }
        }
    }
}
]