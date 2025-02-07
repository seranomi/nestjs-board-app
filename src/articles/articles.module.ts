import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './articles.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forFeature([Article]), // Article 에터티를 TypeORM 모듈에 등록
    ],
    controllers: [ArticlesController],
    providers: [ArticlesService],
})
export class ArticlesModule {}
