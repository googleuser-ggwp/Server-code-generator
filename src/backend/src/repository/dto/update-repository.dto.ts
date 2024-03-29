import {
  IsDefined,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateConfigDto {
  @IsOptional()
  @IsString()
  apiPrefix: string;

  @IsDefined()
  @IsInt()
  @Min(1024)
  port: number;

  @IsDefined()
  @IsString()
  dbConnectionUri: string;
}

export class UpdateRepositoryDto {
  @IsDefined()
  @IsString()
  name: string;

  @IsDefined()
  @IsString()
  type: 'JSON_RPC' | 'REST_API';

  @IsDefined()
  @ValidateNested()
  @Type(() => UpdateConfigDto)
  config!: UpdateConfigDto;
}
