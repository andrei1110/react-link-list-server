// src/users/users.controller.ts
import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { Req as ReqType } from 'src/types/req';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async register(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    const { passwordHash: _hash, ...rest } = user;
    return { data: rest, succes: true, message: 'User created' };
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: ReqType) {
    return {
      data: req.user,
      success: true,
      message: 'Valid user',
    };
  }
}
