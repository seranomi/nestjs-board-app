import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import * as dotenv from 'dotenv';
import { Request } from "express";
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) {
		// [3] Cookie에 있는 JWT 토큰을 추출
		super({
			secretOrKey: process.env.JWT_SECRET,
			jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) =>{
				let token = null;
				if(req && req.cookies){
					token = req.cookies['Authorization']; // 쿠키에서 JWT 추출
				}
				return token;
			}])
		})
	} // [4] Secret Key로 검증 - 해당 인스턴스가 생성되는 시점 자체가 검증과정

	// [5] JWT에서 사용자 정보 가져오기(인증)
	async validate(payload) {
		const { email } = payload;

		const user: User = await this.usersRepository.findOneBy({ email });

		if (!user){
			throw new NotFoundException();
		}
		return user;
	}
}