import { ApiProperty } from '@nestjs/swagger';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { isNil } from 'lodash';

export const isEmptyObj = <T>(obj: T | undefined | null): boolean => {
  if (isNil(obj) || typeof obj !== 'object' || obj === null) return true;
  return Object.keys(obj).length === 0;
};

export const omitEmpty = <T extends Record<string, any> | any[]>(obj: T): T => {
  if (Array.isArray(obj)) {
    return obj.map((x) => {
      return typeof x === 'object' ? omitEmpty(x) : x;
    }) as any;
  }

  if (isEmptyObj(obj)) return {} as any;

  return Object.keys(obj).reduce((r, k) => {
    const v = obj[k];
    if (v === undefined || v === null) return r;

    if (v instanceof Date) r[k] = v;
    else if (Array.isArray(v) || typeof v === 'object') r[k] = omitEmpty(v);
    else r[k] = v;

    return r;
  }, {} as any);
};

export const filterNullable = <T>(items: T[]) => {
  return items.filter((x): x is Exclude<T, null | undefined> => !!x);
};

export const toDto = <T>(cls: ClassConstructor<T>, obj: Partial<T>): T => {
  const dto = plainToClass(cls, obj);
  return omitEmpty(dto) as T;
};

export class OkResponseDto {
  @ApiProperty({ enum: ['ok'] })
  status: 'ok';

  static create(): OkResponseDto {
    return { status: 'ok' };
  }
}
