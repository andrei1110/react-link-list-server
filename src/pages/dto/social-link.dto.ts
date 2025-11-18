// src/pages/dto/social-link.dto.ts
import { IsEnum, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { SocialType } from '../social-link.entity';

export class SocialLinkDto {
  @IsEnum(SocialType)
  type: SocialType;

  @IsUrl()
  url: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  order?: number;
}
