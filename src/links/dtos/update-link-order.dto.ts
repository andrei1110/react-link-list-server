import { IsArray, ValidateNested, IsString, IsNumber } from "class-validator";
import { Type } from "class-transformer";

class LinkOrderDto {
  @IsString()
  id: string;

  @IsNumber()
  order: number;
}

export class UpdateLinkOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkOrderDto)
  links: LinkOrderDto[];
}
