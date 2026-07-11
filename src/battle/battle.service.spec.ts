import { Test, TestingModule } from '@nestjs/testing';
import { BattleService } from './battle.service';
import { DatabaseService } from 'src/database/database.service';

describe('BattleService', () => {
  let service: BattleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BattleService,
        {
          provide: DatabaseService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<BattleService>(BattleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
