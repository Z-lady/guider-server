import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { AuthDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-code')
  async sendCode(@Body('email') email: string, @Request() req) {
    const ip =
      req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
    return this.authService.sendCode(email, ip);
  }

  @Post('verify-code')
  async verifyCode(@Body() body: { email: string; code: string }) {
    try {
      return await this.authService.verifyCode(body.email, body.code);
    } catch (error) {
      console.error('验证码校验失败:', error.message);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || '验证码校验失败',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    console.log('login controller called, req.user:', req.user);
    return this.authService.login(req.user);
  }

  @Post('register')
  register(@Body() registerAuthDto: RegisterAuthDto) {
    return this.authService.register(registerAuthDto);
  }

  @Post('authenticate')
  async authenticate(@Body() authDto: AuthDto) {
    console.log('authenticate controller called, authDto:', authDto);
    return this.authService.authenticate(authDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req) {
    return req.user;
  }

  // 新增：获取完整用户信息接口
  @UseGuards(JwtAuthGuard)
  @Get('user-info')
  async getUserInfo(@Req() req) {
    try {
      return await this.authService.getUserFullInfo(req.user.id);
    } catch (error) {
      console.error('获取用户信息失败:', error.message);
      throw new HttpException(
        '获取用户信息失败',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
