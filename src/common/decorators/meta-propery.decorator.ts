import { applyDecorators } from '@nestjs/common';
import {
  ApiProperty,
  ApiPropertyOptional,
  ApiPropertyOptions,
} from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { filterNullable } from '../utils';

type Options = ApiPropertyOptions;

export const MetaProperty = (options: Options = {}) => {
  options.required = options.required ?? true;

  const optionalDecorators = options.required
    ? []
    : [ApiPropertyOptional(), IsOptional()];

  const decorators = filterNullable([
    ApiProperty(options),
    ...optionalDecorators,
  ]);

  return applyDecorators(...decorators);
};
