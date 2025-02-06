import { BadRequestException, ConflictException, Injectable, Logger, Res, UnauthorizedException } from '@nestjs/common';
import { Response, Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
	private readonly logger = new Logger(AuthService.name);

	constructor(
		@InjectRepository(User)
		private UsersRepository: Repository<User>,
		private jwtService: JwtService
	){}

	// 회원 가입 기능
	async signUp(createUserDto: CreateUserDto): Promise<User> {
		const { username, password, email, role } = createUserDto;
		this.logger.verbose(`Attempting to sign up user with email: ${email}`);

		if (!username || !password || !email || !role){
			throw new BadRequestException('Something went wrong.');
		}

		// 이메일 중복 확인
		await this.checkEmailExists(email);

		// 비밀번호 해싱
		const hashedPassword = await this.hashPassword(password);

		const newUser: User = {
			id: 0,
			username,
			password: hashedPassword, // 해싱된 비밀번호 사용
			email,
			role,
			boards: []
		};

		const createdUser = await this.UsersRepository.save(newUser);
		return createdUser;
	}

	// 로그인
	async signIn(loginUserDto: LoginUserDto): Promise<string> {
		const { email, password } = loginUserDto;
		this.logger.verbose(`Attempting to sign in user with email: ${email}`);

		try{
			const existingUser = await this.findUserByEmail(email);
			
			if (!existingUser || !(await bcrypt.compare(password, existingUser.password))){
				this.logger.warn(`Failed login attempt for email: ${email}`);
				throw new UnauthorizedException('Incorrect email or password');
			}
			// [1] JWT토큰 생성
			const payload = {
				email: existingUser.email,
				username: existingUser.username,
				role: existingUser.role
			};
			const accessToken = await this.jwtService.sign(payload)

			this.logger.verbose(`User signed in successfully with email: ${email}`);
			return accessToken;
		} catch (error) {
			this.logger.error('Signin failed', error.stack);
			throw error;
		}
	}
	
	// 이메일 중복 확인 메서드
	private async checkEmailExists(email: string): Promise<void> {
		this.logger.verbose(`Checking if email exists: ${email}`);

		const existingUser = await this.UsersRepository.findOne({ where: { email } });
		if(existingUser) {
			this.logger.warn(`Email already exists: ${email}`);
			throw new ConflictException('Email already exists');
		}
		this.logger.verbose(`Email is available: ${email}`);
	}

	// 이메일로 유저 찾기 메서드
	private async findUserByEmail(email: string): Promise<User | undefined>{
		return await this.UsersRepository.findOne({ where: { email }});
	}

	// 비밀번호 해싱 암호화 메서드
	private async hashPassword(password: string): Promise<string> {
		this.logger.verbose(`Hashing password`);

		const salt = await bcrypt.genSalt(); // 솔트 생성
		return await bcrypt.hash(password, salt); // 비밀번호 해싱
	}
}
