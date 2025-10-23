import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dtos/update-user.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "./entities/user.entity";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("profile")
  async getProfile(@Request() req): Promise<User> {
    return this.usersService.findById(req.user.id);
  }

  @Put("profile")
  async updateProfile(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ): Promise<User> {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  @Delete("profile")
  async deleteProfile(@Request() req): Promise<void> {
    return this.usersService.remove(req.user.id);
  }
}
