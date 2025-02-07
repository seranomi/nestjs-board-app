import {
    Body,
    Controller,
    Delete,
    Get,
    Logger,
    Param,
    Patch,
    Post,
    Put,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { Article } from './articles.entity';
import { CreateArticleRequestDto } from './dto/create-article-request.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import { ArticleSearchResponseDto } from './dto/article-search-response.dto';
import { UpdateArticleRequestDto } from './dto/update-article-request.dto';
import { ArticleStatusValidationPipe } from './pipes/article-status-vaildation.pipe';
import { ArticleStatus } from './articles-status.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/custom-role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/auth/users-role.enum';
import { User } from 'src/auth/user.entity';
import { GetUser } from 'src/auth/get-user.decorator';

@Controller('api/articles') // 엔드포인트
@UseGuards(AuthGuard(), RolesGuard)
export class ArticlesController {
    private readonly logger = new Logger(ArticlesController.name); // Logger 인스턴스 생성

    // 생성자 주입
    constructor(private articlesService: ArticlesService) {}

    // 게시글 작성 기능
    @Post('/') // PostMappint 핸들러 데코레이터
    @Roles(UserRole.USER) // User만 게시글 작성 가능
    async createArticle(
        @Body() createArticleRequestDto: CreateArticleRequestDto,
        @GetUser() logginedUser: User,
    ): Promise<ArticleResponseDto> {
        this.logger.verbose(
            `User ${logginedUser.username} creatin a new article. Data: ${JSON.stringify(createArticleRequestDto)}`,
        );
        const articleResponseDto = new ArticleResponseDto(
            await this.articlesService.createArticle(
                createArticleRequestDto,
                logginedUser,
            ),
        );
        return articleResponseDto;
        // return new ApiResponseDto(true, HttpSatus.CREATED, 'Article create success');
    }

    // 모든 게시글 조회 기능
    @Get('/')
    @Roles(UserRole.USER)
    async getAllArticles(): Promise<ArticleResponseDto[]> {
        this.logger.verbose('Retrieving all articles');
        const articles: Article[] = await this.articlesService.getAllArticles();
        const articlesResponseDto = articles.map(
            (article) => new ArticleResponseDto(article),
        );
        return articlesResponseDto;
    }
    // 나의 게시글 조회 기능(로그인 유저)
    @Get('/myarticles')
    @Roles(UserRole.USER)
    async getMyAllArticles(
        @GetUser() logginedUser: User,
    ): Promise<ArticleResponseDto[]> {
        this.logger.verbose(
            `User ${logginedUser.username} retrieving their articles`,
        );
        const articles: Article[] =
            await this.articlesService.getMyAllArticles(logginedUser);
        const articlesResponseDto = articles.map(
            (article) => new ArticleResponseDto(article),
        );
        return articlesResponseDto;
    }
    // 특정 게시글 조회 기능
    @Get('/:id')
    async getArticleDetailById(
        @Param('id') id: number,
    ): Promise<ArticleResponseDto> {
        this.logger.verbose(`Retrieving article with ID ${id}`);
        const articleResponseDto = new ArticleResponseDto(
            await this.articlesService.getArticleDetailById(id),
        );
        return articleResponseDto;
    }
    // 키워드(작성자)로 검색한 게시글 조회 기능
    @Get('/search/:keyword') // 쿼리 스트링 keyword?author=Jack
    async getArticlesByKeyword(
        @Query('author') author: string,
    ): Promise<ArticleSearchResponseDto[]> {
        this.logger.verbose(`Searching articles by author ${author}`);
        const articles: Article[] =
            await this.articlesService.getArticlesByKeyword(author);
        const articlesResponseDto = articles.map(
            (article) => new ArticleSearchResponseDto(article),
        );
        return articlesResponseDto;
    }

    // 특정 번호의 게시글 수정 기능
    @Put('/:id')
    async updateArticleById(
        @Param('id') id: number,
        @Body() updateArticleRequestDto: UpdateArticleRequestDto,
    ): Promise<ArticleResponseDto> {
        this.logger.verbose(`Updating article with ID ${id}`);
        const articleResponseDto = new ArticleResponseDto(
            await this.articlesService.updateArticleById(
                id,
                updateArticleRequestDto,
            ),
        );
        return articleResponseDto;
    }
    // 특정 번호의 게시글 일부 수정 기능 <ADMIN>
    @Patch('/:id')
    @Roles(UserRole.ADMIN)
    async updateArticleStatusById(
        @Param('id') id: number,
        @Body('status', ArticleStatusValidationPipe) status: ArticleStatus,
        @GetUser() logginedUser: User,
    ): Promise<void> {
        this.logger.verbose(
            `Admin ${logginedUser.username} updating status of article ID ${id} to ${status}`,
        );
        await this.articlesService.updateArticleStatusById(id, status);
    }

    // 특정 번호의 게시글 삭제 기능
    @Delete('/:id')
    @Roles(UserRole.USER, UserRole.ADMIN) // ADMIN, USER만 게시글 삭제 가능
    async deleteArticleById(
        @Param('id') id: number,
        @GetUser() logginedUser: User,
    ): Promise<void> {
        await this.articlesService.deleteArticleById(id, logginedUser);
    }
}
