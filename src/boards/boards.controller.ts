import { Controller, Get } from '@nestjs/common';
import { BoardsService } from './boards.service';

@Controller('boards') // 엔드포인트
export class BoardsController {
  constructor(private boardsService: BoardsService) {}

  @Get('hello')
  async hello(): Promise<string> {
    return 'Hello from BoardsService';
  }
}
