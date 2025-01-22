import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Blog } from './blogs.entity';
import { BlogStatus } from './blogs-status.enum';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  // 데이터 베이스
  private blogs: Blog[] = [];

  // 모든 게시글 조회 기능
  getAllBlogs(): Blog[] {
    const foundBlogs = this.blogs;
    if (foundBlogs.length === 0) {
      throw new NotFoundException('No blogs found');
    }
    return foundBlogs;
  }
  // 특정 게시글 조회 기능
  getBlogDetailById(id: number): Blog {
    const foundBlog = this.blogs.find((blog) => blog.id == id);
    if (!foundBlog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }
    return foundBlog;
  }
  // 키워드(작성자)로 검색한 게시글 조회 기능
  getBlogsByKeyword(author: string): Blog[] {
    const foundBlogs = this.blogs.filter((blog) => blog.author === author);
    if (foundBlogs.length === 0) {
      throw new NotFoundException(`No blogs found for author: ${author}`);
    }
    return foundBlogs;
  }

  // 게시글 생성 기능
  createBlog(createBlogDto: CreateBlogDto) {
    const { author, title, contents } = createBlogDto;

    const blog: Blog = {
      id: this.blogs.length + 1, // 임시 Auto Increament 기능
      author,
      title,
      contents,
      status: BlogStatus.PUBLIC,
    };

    try {
      this.blogs.push(blog);
      return blog; // `push`는 저장된 길이를 반환하므로 `blog` 객체를 반환하도록 수정
    } catch (error) {
      throw new InternalServerErrorException('Failed to create blog');
    }
  }

  // 특정 번호의 게시글 수정
  updateBlogById(id: number, updateBlogDto: UpdateBlogDto): Blog {
    const foundBlog = this.getBlogDetailById(id); // 여기서 이미 예외처리를 하고 있다
    const { title, contents } = updateBlogDto;
    foundBlog.title = title;
    foundBlog.contents = contents;
    return foundBlog;
  }
  // 특정 번호의 게시글 일부 수정
  updateBlogStatusById(id: number, status: BlogStatus): Blog {
    const foundBlog = this.getBlogDetailById(id);

    // status는 PUBLIC PRIVATE 두 값중 하나만 갖는다.

    foundBlog.status = status;
    return foundBlog;
  }

  // 게시글 삭제 기능
  deleteBlogById(id: number): void {
    // 게시글 존재 여부 확인
    const foundBlog = this.getBlogDetailById(id);
    this.blogs = this.blogs.filter((blog) => blog.id != id);
  }
}
