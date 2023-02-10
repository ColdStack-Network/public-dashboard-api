import { ApiProperty } from '@nestjs/swagger';

export class StorageClasses {
  @ApiProperty()
  name: string;

  @ApiProperty()
  'Standard': string;

  @ApiProperty()
  'Intelligent-Tiering': string;

  @ApiProperty()
  'Standard-IA': string;

  @ApiProperty()
  'Glacier Instant Retrieval': string;

  @ApiProperty()
  'Glacier Flexible Retrieval': string;

  @ApiProperty()
  'Glacier Deep Archive': string;
}
