import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { Article } from './articles.entity';
import { ArticleStatus } from './articles-status.enum';
import { CreateArticleRequestDto } from './dto/create-article-request.dto';
import { UpdateArticleRequestDto } from './dto/update-article-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { User } from 'src/auth/user.entity';

@Injectable()
export class ArticlesService {
    private readonly logger = new Logger(ArticlesService.name); // Logger인스턴스 생성

    // Repository 계층 DI
    constructor(
        @InjectRepository(Article)
        private articleRepository: Repository<Article>,
    ) {}

    // 모든 게시글 조회 기능
    async getAllArticles(): Promise<Article[]> {
        this.logger.verbose('Retrieving all articles');

        const foundArticles = await this.articleRepository.find();

        this.logger.verbose(`Retrieving all articles list Successfully`);
        return foundArticles;
    }
    // 로그인된 유저가 작성한 게시글 조회 기능
    async getMyAllArticles(logginedUser: User): Promise<Article[]> {
        this.logger.verbose(
            `User ${logginedUser.username} is retrieving their own articles`,
        );
        // 기본 조회에서는 엔터티를 즉시로딩으로 변경해야 User에 접근 할 수 있다.
        // const foundArticles = await this.articleRepository.findBy({ user: logginedUser });

        // 쿼리 빌더를 통해 lazy loading 설정된 엔터티와 관계를 가진 엔터티(User) 명시적 접근
        const foundArticles = await this.articleRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.user', 'usesr') // 사용자 정보를 조인(레이지 로딩 상태에서 추가 쿼리)
            .where('article.userId = :userId', { userId: logginedUser.id })
            .getMany();
        this.logger.verbose(
            `Retrieving ${logginedUser.username}'s articles list Successfully`,
        );
        return foundArticles;
    }
    // 특정 게시글 조회 기능
    async getArticleDetailById(id: number): Promise<Article> {
        this.logger.verbose(`Retrieving article with ID ${id}`);

        const foundArticles = await this.articleRepository
            .createQueryBuilder('article')
            .leftJoinAndSelect('article.user', 'usesr') // 사용자 정보를 조인
            .where('article.id = :id', { id })
            .getOne();
        if (!foundArticles) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }
        this.logger.verbose(`Retrieving article by id:${id} Successfully`);
        return foundArticles;
        // const foundArticle = this.articleRepository.findOneBy({ id: id });
        // return foundArticle;
    }
    // 키워드(작성자)로 검색한 게시글 조회 기능
    async getArticlesByKeyword(author: string): Promise<Article[]> {
        this.logger.verbose(`Retrieving articles by author: ${author}`);
        if (!author) {
            throw new BadRequestException('Author keyword must be provided');
        }
        const foundArticles = await this.articleRepository.findBy({
            author: author,
        });
        if (foundArticles.length === 0) {
            throw new NotFoundException(
                `No articles found for author: ${author}`,
            );
        }

        this.logger.verbose(
            `Retrieving articles by author: ${author} Successfully`,
        );
        return foundArticles;
    }

    // 게시글 작성 기능
    async createArticle(
        createArticleRequestDto: CreateArticleRequestDto,
        logginedUser: User,
    ): Promise<Article> {
        this.logger.verbose(
            `User ${logginedUser.username} is creating a new article with title: ${createArticleRequestDto.title}`,
        );
        const { title, contents } = createArticleRequestDto;
        if (!title || !contents) {
            throw new BadRequestException(
                'Title, and contents must be provided',
            );
        }
        const newArticle = this.articleRepository.create({
            author: logginedUser.username,
            title,
            contents,
            status: ArticleStatus.PUBLIC,
            user: logginedUser,
        });

        const createArticle = this.articleRepository.save(newArticle);

        this.logger.verbose(`Article created by User ${logginedUser.username}`);
        return createArticle; // `push`는 저장된 길이를 반환하므로 `article` 객체를 반환하도록 수정
    }

    // 특정 번호의 게시글 수정
    async updateArticleById(
        id: number,
        updateArticleRequestDto: UpdateArticleRequestDto,
    ): Promise<Article> {
        this.logger.verbose(`Attempting to update article with ID ${id}`);

        const foundArticle = await this.getArticleDetailById(id); // 여기서 이미 예외처리를 하고 있다
        const { title, contents } = updateArticleRequestDto;
        if (!title || !contents) {
            throw new BadRequestException(
                'Title and contents must be provided',
            );
        }
        foundArticle.title = title;
        foundArticle.contents = contents;
        const updatedArticle = await this.articleRepository.save(foundArticle);

        this.logger.verbose(`Article with ID ${id} updated successfully`);
        return updatedArticle;
    }

    // 특정 번호의 게시글 일부 수정 ***
    async updateArticleStatusById(
        id: number,
        status: ArticleStatus,
    ): Promise<void> {
        this.logger.verbose(
            `ADMIN is attempting to update the status of article with ID ${id} to ${status}`,
        );

        const result = await this.articleRepository.update(id, { status });
        if (result.affected === 0) {
            throw new NotFoundException(`Article with ID ${id} not found`);
        }

        this.logger.verbose(
            `Article with ID ${id} status updated to ${status} by Admin`,
        );
    }

    // 게시글 삭제 기능
    async deleteArticleById(id: number, logginedUser: User): Promise<void> {
        this.logger.verbose(
            `User ${logginedUser.username} is attempting to delete article with ID ${id}`,
        );

        // 게시글 존재 여부 확인
        const foundArticle = await this.getArticleDetailById(id);
        if (foundArticle.user.id !== logginedUser.id) {
            throw new UnauthorizedException(
                'Do not have permission to delete this article',
            );
        }
        await this.articleRepository.delete(foundArticle);

        this.logger.verbose(
            `Article with ID ${id} deleted by User ${logginedUser.username}`,
        );
    }
}
