import { IsOptional, IsString } from "class-validator";

export class DuplicatePageDto {
  @IsOptional()
  @IsString()
  newTitle?: string;

  @IsOptional()
  @IsString()
  newPermalink?: string;
}
