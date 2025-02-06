import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { Board } from './boards.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { BoardResponseDto } from './dto/board-response.dto';
import { BoardSearchResponseDto } from './dto/board-search-response.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardStatusValidationPipe } from './pipes/board-status-vaildation.pipe';
import { BoardStatus } from './boards-status.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/custom-role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/auth/users-role.enum';
import { User } from 'src/auth/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('api/boards') // 엔드포인트
@UseGuards(AuthGuard(), RolesGuard)
export class BoardsController {
  // 생성자 주입
  constructor(private boardsService: BoardsService) {}

  // 게시글 작성 기능
  @Post('/') // 파라미터시점에서 유효성 검사
  @Roles(UserRole.USER) // User만 게시글 작성 가능
  async createBoard(@Body() createBoardDto: CreateBoardDto, @GetUser() logginedUser: User): Promise<BoardResponseDto> {
    const boardResponseDto = new BoardResponseDto(await this.boardsService.createBoard(createBoardDto, logginedUser));
    return boardResponseDto;
  }

  // 모든 게시글 조회 기능
  @Get('/')
  @Roles(UserRole.USER)
  async getAllBoards(): Promise<BoardResponseDto[]> {
    const boards: Board[] = await this.boardsService.getAllBoards();
    const boardsResponseDto = boards.map((board) => new BoardResponseDto(board));
    return boardsResponseDto;
  }
  // 나의 게시글 조회 기능(로그인 유저)
  @Get('/myboards')
  @Roles(UserRole.USER)
  async getMyAllBoards(@GetUser() logginedUser: User): Promise<BoardResponseDto[]> {
    const boards: Board[] = await this.boardsService.getMyAllBoards(logginedUser);
    const boardsResponseDto = boards.map((board) => new BoardResponseDto(board));
    return boardsResponseDto;
  }
  // 특정 게시글 조회 기능
  @Get('/:id')
  async getBoardDetailById(@Param('id') id: number): Promise<BoardResponseDto> {
    const boardResponseDto = new BoardResponseDto(await this.boardsService.getBoardDetailById(id));
    return boardResponseDto;
  }
  // 키워드(작성자)로 검색한 게시글 조회 기능
  @Get('/search/:keyword') // 쿼리 스트링 keyword?author=Jack
  async getBoardsByKeyword(@Query('author') author: string): Promise<BoardSearchResponseDto[]> {
    const boards: Board[] = await this.boardsService.getBoardsByKeyword(author);
    const boardsResponseDto = boards.map((board) => new BoardSearchResponseDto(board));
    return boardsResponseDto;
  }

  // 특정 번호의 게시글 수정 기능
  @Put('/:id')
  async updateBoardById(
    @Param('id') id: number,
    @Body() updateBoardDto: UpdateBoardDto): Promise<BoardResponseDto> {
    const boardResponseDto = new BoardResponseDto(await this.boardsService.updateBoardById(id, updateBoardDto));
    return boardResponseDto;
  }
  // 특정 번호의 게시글 일부 수정 기능 <ADMIN>
  @Patch('/:id')
  @Roles(UserRole.ADMIN)
  async updateBoardStatusById(
    @Param('id') id: number,
    @Body('status', BoardStatusValidationPipe) status: BoardStatus): Promise<void> {
    await this.boardsService.updateBoardStatusById(id, status);
  }

  // 특정 번호의 게시글 삭제 기능
  @Delete('/:id')
  @Roles(UserRole.USER, UserRole.ADMIN) // ADMIN, USER만 게시글 삭제 가능
  async deleteBoardById(@Param('id') id: number, @GetUser() logginedUser: User): Promise<void> {
    await this.boardsService.deleteBoardById(id, logginedUser);
  }
}
