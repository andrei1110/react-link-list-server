import { IsOptional, IsBoolean } from "class-validator";

export class PageStatsQueryDto {
  @IsOptional()
  @IsBoolean()
  includeLinks?: boolean;
}
