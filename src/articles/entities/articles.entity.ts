import {
    Column,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { ArticleStatus } from './articles-status.enum';
import { User } from 'src/auth/user.entity';
@Entity()
export class Article {
    @PrimaryGeneratedColumn() // PK + Auto Increment
    id: number;

    @Column() //General Column
    author: string;

    @Column()
    title: string;

    @Column()
    contents: string;

    @Column()
    status: ArticleStatus;

    @ManyToOne((Type) => User, (user) => user.articles, { eager: false })
    user: User;
}
