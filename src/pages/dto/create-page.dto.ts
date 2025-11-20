import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PageStyleDto } from './page-style.dto';
import { LinkDto } from './link.dto';
import { SocialLinkDto } from './social-link.dto';

export class CreatePageDto {
  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PageStyleDto)
  style?: PageStyleDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks?: SocialLinkDto[];
}
