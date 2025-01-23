import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createPool, Pool } from 'mysql2/promise';
import { databaseConfig } from 'src/configs/database.config';
import { Board } from './boards.entity';

@Injectable()
export class BoardRepository {
  private connectionPool: Pool;

  constructor() {
    this.connectionPool = createPool(databaseConfig);
    this.connectionPool
      .getConnection()
      .then(() => console.log('DB Connected'))
      .catch((err) => console.error('DB connection', err));
  }

  // 게시글 조회관련 데이터 액세스
  async findAll(): Promise<Board[]> {
    const selectQuery = `SELECT * FROM board`;
    try {
      const [result] = await this.connectionPool.query(selectQuery);
	  return result as Board[];
    } catch (err){
		throw new InternalServerErrorException('Database query failed', err);
	}
  }


}
