import { Injectable, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';

const codeStore = new Map<string, { code: string; expires: number }>();
const phoneThrottle = new Map<string, number>();
const ipThrottle = new Map<string, number>();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(login: string, pass: string): Promise<any> {
    console.log(login, pass)
    try {
      let user: User | null = null;
      // a simple check to see if login is an email
      if (login.includes('@')) {
        user = await this.userService.findByEmail(login);
      } else {
        user = await this.userService.findByPhoneNumber(login);
      }

      if (user && user.password && (await bcrypt.compare(pass, user.password))) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      console.error('Error validating user:', error);
      return null;
    }
  }

  async login(user: any) {
    try {
      const payload = { sub: user.id, email: user.email };
      return {
        access_token: this.jwtService.sign(payload),
      };
    } catch (error) {
      console.error('Error generating JWT token:', error);
      throw new Error('Failed to generate authentication token');
    }
  }

  async register(registerAuthDto: RegisterAuthDto): Promise<any> {
    const { email, phoneNumber } = registerAuthDto;

    if (email) {
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    if (phoneNumber) {
      const existingUser = await this.userService.findByPhoneNumber(
        phoneNumber,
      );
      if (existingUser) {
        throw new ConflictException('Phone number already exists');
      }
    }

    // 创建用户，不设置密码
    const newUser = await this.userService.create({
      email: email || undefined,
      phoneNumber: phoneNumber || undefined,
      password: undefined, // 暂时不设置密码
      nickname: undefined,
      avatar: undefined,
      bio: undefined,
      isProfileComplete: false,
    });

    // 注册成功后直接登录，返回 token
    return this.login(newUser);
  }

  async authenticate(authDto: AuthDto): Promise<any> {
    const { email, phoneNumber } = authDto;
    const identifier = email || phoneNumber;

    if (!identifier) {
      throw new Error('Email or phone number is required');
    }

    // 查找用户是否存在
    let user: User | null = null;
    if (email) {
      user = await this.userService.findByEmail(email);
    } else if (phoneNumber) {
      user = await this.userService.findByPhoneNumber(phoneNumber);
    }

    if (user) {
      // 用户存在，直接登录
      console.log('User exists, logging in:', user.email || user.phoneNumber);
      return this.login(user);
    } else {
      // 用户不存在，自动注册
      console.log('User not found, creating new user:', identifier);
      return this.register({ email, phoneNumber });
    }
  }

  async sendCode(phoneNumber: string, ip?: string): Promise<{ success: boolean; message?: string }> {
    const now = Date.now();
    // 手机号节流
    const lastSend = phoneThrottle.get(phoneNumber) || 0;
    if (now - lastSend < 60 * 1000) {
      return { success: false, message: '同一手机号1分钟内只能获取一次验证码' };
    }
    // IP节流
    if (ip) {
      const ipCount = ipThrottle.get(ip) || 0;
      if (ipCount >= 5) {
        return { success: false, message: '同一IP1分钟内最多只能获取5次验证码' };
      }
      ipThrottle.set(ip, ipCount + 1);
      setTimeout(() => {
        ipThrottle.set(ip, Math.max((ipThrottle.get(ip) || 1) - 1, 0));
      }, 60 * 1000);
    }
    phoneThrottle.set(phoneNumber, now);
    setTimeout(() => phoneThrottle.delete(phoneNumber), 60 * 1000);
    const code = generateCode();
    const expires = Date.now() + 5 * 60 * 1000; // 5分钟有效
    codeStore.set(phoneNumber, { code, expires });
    console.log(`[验证码] 发送到 ${phoneNumber} 的验证码是: ${code}`);
    return { success: true };
  }

  async verifyCode(phoneNumber: string, code: string): Promise<any> {
    const entry = codeStore.get(phoneNumber);
    if (!entry || entry.expires < Date.now()) {
      throw new Error('验证码已过期，请重新获取');
    }
    if (entry.code !== code) {
      throw new Error('验证码错误');
    }
    // 验证通过后删除验证码
    codeStore.delete(phoneNumber);
    // 判断用户是否存在
    let user = await this.userService.findByPhoneNumber(phoneNumber);
    if (!user) {
      // 不存在则注册
      user = await this.userService.create({
        phoneNumber,
        password: undefined,
        nickname: undefined,
        avatar: undefined,
        bio: undefined,
        isProfileComplete: false,
      });
      console.log('新用户注册:', phoneNumber);
    } else {
      console.log('老用户登录:', phoneNumber);
    }
    return this.login(user);
  }
}
