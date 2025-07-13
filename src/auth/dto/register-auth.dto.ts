import {
  IsEmail,
  IsString,
  IsOptional,
  IsPhoneNumber,
  ValidateIf,
} from 'class-validator';

export class RegisterAuthDto {
  @IsEmail()
  @IsOptional()
  @ValidateIf((o) => !o.phoneNumber)
  email?: string;

  @IsPhoneNumber()
  @IsOptional()
  @ValidateIf((o) => !o.email)
  phoneNumber?: string;
}
