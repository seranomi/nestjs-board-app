import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Board } from './boards.entity';
import { BoardStatus } from './boards-status.enum';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class BoardsService {
  // Repository 계층 DI
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  // 모든 게시글 조회 기능
  async getAllBoards(): Promise<Board[]> {
    const foundBoards = await this.boardRepository.find();
    return foundBoards;
  }
  // 특정 게시글 조회 기능
  async getBoardDetailById(id: number): Promise<Board> {
    const foundBoard = this.boardRepository.findOneBy({ id: id });
    if (!foundBoard) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }
    return foundBoard;
  }
  // 키워드(작성자)로 검색한 게시글 조회 기능
  async getBoardsByKeyword(author: string): Promise<Board[]> {
    const foundBoards = this.boardRepository.findBy({ author: author });
    return foundBoards;
  }

  // 게시글 생성 기능
  createBoard(createBoardDto: CreateBoardDto): Promise<Board> {
    const { author, title, contents } = createBoardDto;

    const newBoard: Board = {
      id: 0, // 임시 초기화
      author, // author: createBoardDto.author
      title,
      contents,
      status: BoardStatus.PUBLIC,
      user: null
    };
    const createBoard = this.boardRepository.save(newBoard);
    return createBoard; // `push`는 저장된 길이를 반환하므로 `board` 객체를 반환하도록 수정
  }

  // 특정 번호의 게시글 수정
  async updateBoardById(
    id: number,
    updateBoardDto: UpdateBoardDto,
  ): Promise<Board> {
    const foundBoard = await this.getBoardDetailById(id); // 여기서 이미 예외처리를 하고 있다
    const { title, contents } = updateBoardDto;

    foundBoard.title = title;
    foundBoard.contents = contents;

    const updatedBoard = await this.boardRepository.save(foundBoard);
    return updatedBoard;
  }
  // 특정 번호의 게시글 일부 수정
  async updateBoardStatusById(id: number, status: BoardStatus): Promise<void> {
    const result = await this.boardRepository.update(id, { status });
    if (result.affected === 0) {
      throw new NotFoundException(`Board with ID ${id} not found`);
    }
  }

  // 게시글 삭제 기능
  async deleteBoardById(id: number): Promise<void> {
    // 게시글 존재 여부 확인
    const foundBoard = await this.getBoardDetailById(id);
    await this.boardRepository.delete(foundBoard);
  }
}
