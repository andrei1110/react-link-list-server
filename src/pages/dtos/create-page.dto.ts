import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUrl,
  Matches,
  MinLength,
  MaxLength,
} from "class-validator";

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  subtitle?: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message:
      "Permalink can only contain lowercase letters, numbers, and hyphens",
  })
  @MinLength(3)
  @MaxLength(30)
  permalink: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsUrl()
  profileImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  textColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  buttonColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  buttonTextColor?: string;
}
