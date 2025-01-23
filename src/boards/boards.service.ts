import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Board } from './boards.entity';
import { BoardStatus } from './boards-status.enum';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardRepository } from './boards.repository';

@Injectable()
export class BoardsService {
  // Repository 계층 DI
  constructor(private boardsRepository: BoardRepository) {}

  // 모든 게시글 조회 기능
  async getAllBoards(): Promise<Board[]> {
    const foundBoards = await this.boardsRepository.findAll();
    return foundBoards;
  }
  // // 특정 게시글 조회 기능
  // getBoardDetailById(id: number): Board {
  //   const foundBoard = this.boards.find((board) => board.id == id);
  //   if (!foundBoard) {
  //     throw new NotFoundException(`Board with ID ${id} not found`);
  //   }
  //   return foundBoard;
  // }
  // // 키워드(작성자)로 검색한 게시글 조회 기능
  // getBoardsByKeyword(author: string): Board[] {
  //   const foundBoards = this.boards.filter((board) => board.author === author);
  //   if (foundBoards.length === 0) {
  //     throw new NotFoundException(`No boards found for author: ${author}`);
  //   }
  //   return foundBoards;
  // }

  // 게시글 생성 기능
  createBoard(createBoardDto: CreateBoardDto) {
    const { author, title, contents } = createBoardDto;

    const board: Board = {
      id: this.boards.length + 1, // 임시 Auto Increament 기능
      author,
      title,
      contents,
      status: BoardStatus.PUBLIC,
    };

    try {
      this.boards.push(board);
      return board; // `push`는 저장된 길이를 반환하므로 `board` 객체를 반환하도록 수정
    } catch (error) {
      throw new InternalServerErrorException('Failed to create board');
    }
  }

  // // 특정 번호의 게시글 수정
  // updateBoardById(id: number, updateBoardDto: UpdateBoardDto): Board {
  //   const foundBoard = this.getBoardDetailById(id); // 여기서 이미 예외처리를 하고 있다
  //   const { title, contents } = updateBoardDto;
  //   foundBoard.title = title;
  //   foundBoard.contents = contents;
  //   return foundBoard;
  // }
  // // 특정 번호의 게시글 일부 수정
  // updateBoardStatusById(id: number, status: BoardStatus): Board {
  //   const foundBoard = this.getBoardDetailById(id);

  //   // status는 PUBLIC PRIVATE 두 값중 하나만 갖는다.
    
  //   foundBoard.status = status;
  //   return foundBoard;
  // }

  // // 게시글 삭제 기능
  // deleteBoardById(id: number): void {
  //   // 게시글 존재 여부 확인
  //   const foundBoard = this.getBoardDetailById(id);
  //   this.boards = this.boards.filter((board) => board.id != id);
  // }
}
