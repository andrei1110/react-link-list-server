import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import { CreateUserDto } from "../users/dtos/create-user.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateGoogleUser(googleUser: any) {
    let user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (!user) {
      // Criar novo usuário
      const createUserDto: CreateUserDto = {
        email: googleUser.email,
        name: googleUser.name,
        googleId: googleUser.googleId,
        birthDate: new Date().toISOString().split("T")[0], // Data padrão, usuário pode atualizar depois
        avatar: googleUser.avatar,
      };

      user = await this.usersService.create(createUserDto);
    }

    return user;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }
}
