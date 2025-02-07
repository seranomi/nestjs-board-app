import { IsNotEmpty, IsString, Matches } from "class-validator";

export class CreateArticleRequestDto {
  @IsNotEmpty()
  @IsString()
  title: string;
  
  @IsNotEmpty()
  @IsString()
  contents: string;

  // @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'Password too weak', }) 
  // password: string;
}
