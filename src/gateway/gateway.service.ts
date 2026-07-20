// import { Injectable, UnsupportedMediaTypeException, NotFoundException, ForbiddenException} from '@nestjs/common';
// import { BattleService } from 'src/battle/battle.service';

// @Injectable()
// export class GatewayService {
//     constructor(private readonly battleService: BattleService) {}

//     async executeCode(userId: string, battleId: string, code: string) {
//         const battle = await this.battleService.findBattleOrThrow(battleId);
//         // Implement the logic to execute the code here
//         if (!battle)
//             throw new NotFoundException(`Battle ${battleId} not found`);
//         if (!battle.players.some(player => player.id === userId))
//             throw new ForbiddenException(`User ${userId} is not part of battle ${battleId}`);

//         if (battle.challenge.language === 'C')
//             this.executeCCcode(code);
//         else if (battle.challenge.language === 'CPP')
//             this.executeCPPCode(code);
//         else
//             throw new UnsupportedMediaTypeException(`Unsupported language: ${battle.challenge.language}`);
//         // that handles code execution and returns the result.
//         return { success: true, output: 'Code executed successfully' };
//     }

//     private executeCCcode(code: string) {
//         // Implement C code execution logic here

//         console.log('Executing C code:', code);
//     }
    
//     private executeCPPCode(code: string) {
//         // Implement C++ code execution logic here
//         console.log('Executing C++ code:', code);
//     }

// }
