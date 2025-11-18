// src/users/users.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async register(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create(dto);
    // não retorna hash
    const { passwordHash: _hash, ...rest } = user;
    return rest;
  }
}
