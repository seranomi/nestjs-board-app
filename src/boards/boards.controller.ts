import { Controller, Get } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './boards.entity';

@Controller('boards') // 엔드포인트
export class BoardsController {
  // 생성자 주입
  constructor(private boardsService: BoardsService) {}

  // 게시글 조회
  @Get('/')
  getAllBoards(): Board[] {
    return this.boardsService.getAllBoards();
  }
}
