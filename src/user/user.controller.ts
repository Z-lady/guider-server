import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// 创建新的DTO
export class UpdateInfoDto {
  email?: string;
  phoneNumber?: string;
  nickname?: string;
  displayName?: string;
  avatar?: string;
  callingCode?: string;
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.userService.findById(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.userService.update(userId, updateUserDto);
  }

  // 新增的信息修改接口
  @UseGuards(JwtAuthGuard)
  @Post('update-info')
  updateInfo(@Request() req, @Body() updateInfoDto: UpdateInfoDto) {
    const userId = req.user?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return this.userService.updateUserInfo(userId, updateInfoDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }
}
