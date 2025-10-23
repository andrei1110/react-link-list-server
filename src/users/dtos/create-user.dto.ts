import { IsEmail, IsString, IsDateString, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsDateString()
  birthDate: string;

  @IsString()
  googleId: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}
