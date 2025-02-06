import { Body, Controller, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';

@Controller('api/auth')
export class AuthController {
	private readonly logger = new Logger(AuthController.name); // Logger 인스턴스 생성
	constructor(
		private authService: AuthService,
	){}

	// 회원 가입 기능
	@Post('/signup')
	async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto>{
		this.logger.verbose(`Attempting to sign up usesr with email: ${createUserDto.email}`);
		const userResponseDto = new UserResponseDto(await this.authService.signUp(createUserDto))
		return userResponseDto;
	}

	// 로그인 기능
	@Post('/signin')
	async signIn(@Body() loginUserDto: LoginUserDto, @Res() res: Response): Promise<void>{
		this.logger.verbose(`Attempting to sign in user with email: ${loginUserDto.email}`);
		const accessToken = await this.authService.signIn(loginUserDto);

		// [2] JWT를 쿠키에 저장
		res.setHeader('Authorization', accessToken);
		
		res.send({message: "Login Success", accessToken});
	}
	
	@Post('/test')
	@UseGuards(AuthGuard('jwt'))
	testForAuth(@GetUser() logginedUser: User) {
		this.logger.verbose(`Authenticated user accessing test route: ${logginedUser.email}`);
		// console.log(logginedUser); // 인증된 사용자의 정보 출력
		// console.log(logginedUser.id); // 인증된 사용자의 특정 필드 접근
		return { message : 'Authenticated User', user: logginedUser};
	}
}
