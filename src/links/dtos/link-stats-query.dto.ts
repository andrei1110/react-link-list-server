import { IsOptional, IsString } from "class-validator";

export class LinkStatsQueryDto {
  @IsOptional()
  @IsString()
  pageId?: string;
}
