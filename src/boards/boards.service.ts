import { Injectable } from '@nestjs/common';
import { Board } from './boards.entity';
import { BoardsStatus } from './boards-status.enum';
import { CreateBoardDto } from './dto/create-board.dto';

@Injectable()
export class BoardsService {
  // 데이터 베이스
  private boards: Board[] = [];

  // 모든 게시글 조회 기능
  getAllBoards(): Board[] {
    return this.boards;
  }
  // 특정 게시글 조회 기능
  getBoardBoardDetailById(id: number): Board {
    return this.boards.find((board) => board.id == id);
    // 리턴객체(board) => board.id == id 조건문
  }
  // 키워드(작성자)로 검색한 게시글 조회 기능
  getBoardsByKeyword(author: string): Board[]{
    return this.boards.filter((board) => board.author === author);
  }

  // 게시글 생성 기능
  createBoard(createBoardDto: CreateBoardDto) {
    const {author, title, contents} = createBoardDto;
    
    const board: Board = {
      id: this.boards.length + 1, // 임시 Auto Increament 기능
      author,
      title,
      contents,
      status: BoardsStatus.PUBLIC,
    };

    const savedBoard = this.boards.push(board);
    return savedBoard;
  }
}
