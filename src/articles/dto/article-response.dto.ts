import { User } from 'src/auth/user.entity';
import { ArticleStatus } from '../entities/articles-status.enum';
import { Article } from '../entities/articles.entity';

export class ArticleResponseDto {
    id: number;
    author: string;
    title: string;
    contents: string;
    status: ArticleStatus;
    user: User;

    constructor(article: Article) {
        this.id = article.id;
        this.author = article.author;
        this.title = article.title;
        this.contents = article.contents;
        this.status = article.status;
        this.user = article.user;
    }
}
