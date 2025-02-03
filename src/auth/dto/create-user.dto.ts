import {
    IsAlphanumeric,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { UserRole } from '../users-role.enum';

export class CreateUserDto {
    @IsNotEmpty() // null 값 체크
    @MinLength(2) // 최소 문자 수
    @MaxLength(20) // 최대 문자 수
    // @IsAlphanumeric()
    @Matches(/^[가-힣]+$/, { message: 'Username must be in Korean characters' }) // 한글 이름인 경우
    username: string;

    @IsNotEmpty()
    @MaxLength(20)
    @Matches(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        { message: 'Password too weak' },
    ) // 대문자, 소문자, 숫자, 특수문자 포함
    password: string;

    @IsNotEmpty()
    @IsEmail() // 이메일 형식
    @MaxLength(100)
    email: string;

    @IsNotEmpty()
    @IsEnum(UserRole)
    role: UserRole;
}
