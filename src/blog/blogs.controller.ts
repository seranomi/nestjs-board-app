import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { Blog } from './blogs.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogStatus } from './blogs-status.enum';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BlogStatusValidationPipe } from './pipes/blog-status-vaildation.pipe';

@Controller('api/blogs') // 엔드포인트
@UsePipes(ValidationPipe)
export class BlogsController {
  // 생성자 주입
  constructor(private blogsService: BlogsService) {}

  // 모든 게시글 조회 기능
  @Get('/')
  getAllBlogs(): Blog[] {
    return this.blogsService.getAllBlogs();
  }
  // 특정 게시글 조회 기능
  @Get('/:id')
  getBlogDetailById(@Param('id') id: number): Blog {
    return this.blogsService.getBlogDetailById(id);
  }
  // 키워드(작성자)로 검색한 게시글 조회 기능
  @Get('/search/:keyword') // 쿼리 스트링 keyword?author=Jack
  getBlogsByKeyword(@Query('author') author: string): Blog[] {
    return this.blogsService.getBlogsByKeyword(author);
  }

  // 게시글 작성 기능
  @Post('/') // 파라미터시점에서 유효성 검사
  createBlog(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.createBlog(createBlogDto);
  }

  // 특정 번호의 게시글 수정 기능
  @Put('/:id')
  updateBlogById(
    @Param('id') id: number,
    @Body() updateBlogDto: UpdateBlogDto,
  ): Blog {
    return this.blogsService.updateBlogById(id, updateBlogDto);
  }
  // 특정 번호의 게시글 일부 수정 기능
  @Patch('/:id')
  updateBlogStatusById(
    @Param('id') id: number,
    @Body('status', BlogStatusValidationPipe) status: BlogStatus,
  ): Blog {
    return this.blogsService.updateBlogStatusById(id, status);
  }

  // 게시글 삭제 기능
  @Delete('/:id')
  deleteBlogById(@Param('id') id: number): void {
    this.blogsService.deleteBlogById(id);
  }
}
