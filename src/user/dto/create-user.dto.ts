import {
  IsEmail,
  IsString,
  IsOptional,
  IsPhoneNumber,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsOptional()
  @ValidateIf((o) => !o.phoneNumber)
  email?: string;

  @IsPhoneNumber()
  @IsOptional()
  @ValidateIf((o) => !o.email)
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsOptional()
  isProfileComplete?: boolean;
}
