// src/users/users.controller.ts
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import type { Req as ReqType } from 'src/types/req';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async register(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    return { data: user, success: true, message: 'User created' };
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(@Req() req: ReqType, @Body() dto: UpdateUserDto) {
    const updated = await this.usersService.update(req.user.userId, dto);

    return {
      success: true,
      data: updated,
      message: 'User updated',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: ReqType) {
    const { name, email, country, city } = await this.usersService.getMe(
      req.user.userId,
    );
    return {
      data: { name, email, country, city },
      success: true,
      message: 'Valid user',
    };
  }
}
