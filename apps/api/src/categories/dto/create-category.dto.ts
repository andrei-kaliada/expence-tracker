import { IsHexColor, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  // Icon identifier (e.g. "shopping-cart") or a single emoji; rendering is up to the client.
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  icon?: string;
}
