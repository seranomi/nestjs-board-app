import { Body, Controller, Logger, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';

@Controller('api/auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name); // Logger 인스턴스 생성
    constructor(private authService: AuthService) {}

    // 회원 가입 기능
    @Post('/signup')
    async createUser(
        @Body() signUpRequestDto: SignUpRequestDto,
    ): Promise<UserResponseDto> {
        this.logger.verbose(
            `Attempting to sign up usesr with email: ${signUpRequestDto.email}`,
        );
        const userResponseDto = new UserResponseDto(
            await this.authService.signUp(signUpRequestDto),
        );
        return userResponseDto;
    }

    // 로그인 기능
    @Post('/signin')
    async signIn(
        @Body() signInRequestDto: SignInRequestDto,
        @Res() res: Response,
    ): Promise<void> {
        this.logger.verbose(
            `Attempting to sign in user with email: ${signInRequestDto.email}`,
        );
        const accessToken = await this.authService.signIn(signInRequestDto);

        // [2] JWT를 쿠키에 저장
        res.setHeader('Authorization', accessToken);

        res.send({ message: 'Login Success', accessToken });
    }

    @Post('/test')
    @UseGuards(AuthGuard('jwt'))
    testForAuth(@GetUser() logginedUser: User) {
        this.logger.verbose(
            `Authenticated user accessing test route: ${logginedUser.email}`,
        );
        // console.log(logginedUser); // 인증된 사용자의 정보 출력
        // console.log(logginedUser.id); // 인증된 사용자의 특정 필드 접근
        return { message: 'Authenticated User', user: logginedUser };
    }
}
