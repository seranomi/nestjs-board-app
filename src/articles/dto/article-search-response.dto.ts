import { Article } from '../entities/articles.entity';

export class ArticleSearchResponseDto {
    author: string;
    title: string;
    contents: string;

    constructor(article: Article) {
        this.author = article.author;
        this.title = article.title;
        this.contents = article.contents;
    }
}
