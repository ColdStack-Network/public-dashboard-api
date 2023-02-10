import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';

export const IsRequiredString = () => {
  return applyDecorators(IsString(), IsNotEmpty());
};
