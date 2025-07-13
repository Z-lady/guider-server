import { IsString, MinLength } from 'class-validator';

export class LoginAuthDto {
  @IsString()
  login: string;

  @IsString()
  @MinLength(8)
  password: string;
}
