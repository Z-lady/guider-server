import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // 如果更新密码，需要加密
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // 检查是否所有必要信息都已完善
    const isProfileComplete = Boolean(
      (updateUserDto.password || user.password) &&
      (updateUserDto.nickname || user.nickname) &&
      (updateUserDto.avatar || user.avatar)
    );

    await this.usersRepository.update(id, {
      ...updateUserDto,
      isProfileComplete,
    });

    const updatedUser = await this.findById(id);
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }
    return updatedUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { phoneNumber } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }
}
