import {
  IsString,
  IsOptional,
  IsEmail,
  IsPhoneNumber,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';

export class UpdateInfoDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @IsOptional()
  email?: string;

  @IsString({ message: '手机号必须是字符串' })
  @IsOptional()
  phoneNumber?: string;

  @IsString({ message: '用户名必须是字符串' })
  @MinLength(2, { message: '用户名至少需要2个字符' })
  @MaxLength(50, { message: '用户名不能超过50个字符' })
  @IsOptional()
  nickname?: string;

  @IsString({ message: '头像链接必须是字符串' })
  @IsOptional()
  avatar?: string;

  @IsString({ message: '国家代码必须是字符串' })
  @IsOptional()
  callingCode?: string;
}