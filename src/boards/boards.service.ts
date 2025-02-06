import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'; 
import { Board } from './boards.entity';
import { BoardStatus } from './boards-status.enum';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from 'src/auth/user.entity';

@Injectable()
export class BoardsService {
    // Repository 계층 DI
    constructor(
        @InjectRepository(Board)
        private boardRepository: Repository<Board>,
    ) {}

    // 게시글 작성 기능
    async createBoard(createBoardDto: CreateBoardDto, logginedUser: User): Promise<Board> {
        const { title, contents } = createBoardDto;

        const newBoard = this.boardRepository.create({
            author: logginedUser.username,
            title,
            contents,
            status: BoardStatus.PUBLIC,
            user: logginedUser
        });
        
        const createBoard = this.boardRepository.save(newBoard);
        return createBoard; // `push`는 저장된 길이를 반환하므로 `board` 객체를 반환하도록 수정
    }

    // 모든 게시글 조회 기능
    async getAllBoards(): Promise<Board[]> {
        const foundBoards = await this.boardRepository.find();
        return foundBoards;
    }
    // 로그인된 유저가 작성한 게시글 조회 기능
    async getMyAllBoards(logginedUser: User): Promise<Board[]> {
        // 기본 조회에서는 엔터티를 즉시로딩으로 변경해야 User에 접근 할 수 있다. 
        // const foundBoards = await this.boardRepository.findBy({ user: logginedUser });
        
        // 쿼리 빌더를 통해 lazy loading 설정된 엔터티와 관계를 가진 엔터티(User) 명시적 접근
        const foundBoards = await this.boardRepository.createQueryBuilder('board')
            .leftJoinAndSelect('board.user', 'usesr') // 사용자 정보를 조인(레이지 로딩 상태에서 추가 쿼리)
            .where('board.userId = :userId', { userId : logginedUser.id })
            .getMany();
        return foundBoards;
    }
    // 특정 게시글 조회 기능
    async getBoardDetailById(id: number): Promise<Board> {
        const foundBoards = await this.boardRepository.createQueryBuilder('board')
            .leftJoinAndSelect('board.user', 'usesr') // 사용자 정보를 조인
            .where('board.id = :id', { id })
            .getOne();
        if (!foundBoards) {
            throw new NotFoundException(`Board with ID ${id} not found`);
        }
        return foundBoards;
        // const foundBoard = this.boardRepository.findOneBy({ id: id });
        // return foundBoard;
    }
    // 키워드(작성자)로 검색한 게시글 조회 기능
    async getBoardsByKeyword(author: string): Promise<Board[]> {
        const foundBoards = this.boardRepository.findBy({ author: author });
        return foundBoards;
    }

    // 특정 번호의 게시글 수정
    async updateBoardById(id: number, updateBoardDto: UpdateBoardDto): Promise<Board> {
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
    async deleteBoardById(id: number, logginedUser: User): Promise<void> {
        // 게시글 존재 여부 확인
        const foundBoard = await this.getBoardDetailById(id);
        if (foundBoard.user.id !== logginedUser.id){
            throw new UnauthorizedException('Do not have permission to delete this board');
        }
        await this.boardRepository.delete(foundBoard);
    }
}
