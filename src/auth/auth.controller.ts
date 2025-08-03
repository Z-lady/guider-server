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
import { ResponseUtil, ApiResponse } from '../common/response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-code')
  async sendCode(@Body('email') email: string, @Request() req): Promise<ApiResponse> {
    try {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
      const result = await this.authService.sendCode(email, ip);
      
      if (result.success) {
        return ResponseUtil.success(null, '验证码发送成功');
      } else {
        return ResponseUtil.badRequest(result.message || '验证码发送失败');
      }
    } catch (error) {
      console.error('发送验证码失败:', error.message);
      return ResponseUtil.serverError('验证码发送失败');
    }
  }

  @Post('verify-code')
  async verifyCode(@Body() body: { email: string; code: string }): Promise<ApiResponse> {
    try {
      const result = await this.authService.verifyCode(body.email, body.code);
      return ResponseUtil.success(result, '验证码校验成功');
    } catch (error) {
      console.error('验证码校验失败:', error.message);
      
      if (error.message?.includes('验证码已过期')) {
        return ResponseUtil.badRequest('验证码已过期，请重新获取');
      } else if (error.message?.includes('验证码错误')) {
        return ResponseUtil.badRequest('验证码错误');
      }
      
      return ResponseUtil.serverError('验证码校验失败');
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req): Promise<ApiResponse> {
    try {
      console.log('login controller called, req.user:', req.user);
      const result = await this.authService.login(req.user);
      return ResponseUtil.success(result, '登录成功');
    } catch (error) {
      console.error('登录失败:', error.message);
      return ResponseUtil.serverError('登录失败');
    }
  }

  @Post('register')
  async register(@Body() registerAuthDto: RegisterAuthDto): Promise<ApiResponse> {
    try {
      const result = await this.authService.register(registerAuthDto);
      return ResponseUtil.success(result, '注册成功');
    } catch (error) {
      console.error('注册失败:', error.message);
      
      if (error.message?.includes('already exists')) {
        return ResponseUtil.badRequest('用户已存在');
      }
      
      return ResponseUtil.serverError('注册失败');
    }
  }

  @Post('authenticate')
  async authenticate(@Body() authDto: AuthDto): Promise<ApiResponse> {
    try {
      console.log('authenticate controller called, authDto:', authDto);
      const result = await this.authService.authenticate(authDto);
      return ResponseUtil.success(result, '认证成功');
    } catch (error) {
      console.error('认证失败:', error.message);
      return ResponseUtil.serverError('认证失败');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req): ApiResponse {
    try {
      return ResponseUtil.success(req.user, '获取用户信息成功');
    } catch (error) {
      return ResponseUtil.unauthorized('Token无效或已过期');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('user-info')
  async getUserInfo(@Req() req): Promise<ApiResponse> {
    try {
      const result = await this.authService.getUserFullInfo(req.user.id);
      return ResponseUtil.success(result, '获取用户信息成功');
    } catch (error) {
      console.error('获取用户信息失败:', error.message);
      
      if (error.message?.includes('用户不存在')) {
        return ResponseUtil.notFound('用户不存在');
      }
      
      return ResponseUtil.serverError('获取用户信息失败');
    }
  }
}
