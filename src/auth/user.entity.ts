import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './users-role.enum';
import { Article } from 'src/articles/entities/articles.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    password: string;

    @Column({ unique: true })
    email: string;

    @Column()
    role: UserRole;

    @OneToMany((Type) => Article, (article) => article.author, { eager: false })
    articles: Article[];
}
