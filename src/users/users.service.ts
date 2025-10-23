import {
  Injectable,
  ConflictException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dtos/create-user.dto";
import { UpdateUserDto } from "./dtos/update-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar se email já existe
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Verificar se googleId já existe
    const existingGoogleUser = await this.findByGoogleId(
      createUserDto.googleId
    );
    if (existingGoogleUser) {
      throw new ConflictException(
        "User with this Google account already exists"
      );
    }

    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ["pages", "pages.links"],
    });
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { googleId },
      relations: ["pages", "pages.links"],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ["pages", "pages.links"],
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Verificar unicidade do email se estiver sendo atualizado
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException("Email already in use");
      }
    }

    // Verificar unicidade do googleId se estiver sendo atualizado
    if (updateUserDto.googleId && updateUserDto.googleId !== user.googleId) {
      const existingUser = await this.findByGoogleId(updateUserDto.googleId);
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException("Google ID already in use");
      }
    }

    const updatedUser = this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    await this.usersRepository.remove(user);
  }

  // Método para buscar usuário com suas páginas ativas
  async findUserWithActivePages(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id: userId },
      relations: ["pages", "pages.links"],
    });
  }
}
