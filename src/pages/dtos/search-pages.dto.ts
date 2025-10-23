import { IsString, MinLength } from "class-validator";

export class SearchPagesDto {
  @IsString()
  @MinLength(2)
  q: string;
}
