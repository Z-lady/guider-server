import {
  IsEmail,
  IsString,
  IsOptional,
  IsPhoneNumber,
  ValidateIf,
} from 'class-validator';

export class AuthDto {
  @IsEmail()
  @IsOptional()
  @ValidateIf((o) => !o.phoneNumber)
  email?: string;

  @IsPhoneNumber('CN')
  @IsOptional()
  @ValidateIf((o) => !o.email)
  phoneNumber?: string;
}
