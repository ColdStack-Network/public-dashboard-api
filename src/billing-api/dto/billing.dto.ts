import { ApiProperty } from '@nestjs/swagger';
import prettyBytes from 'pretty-bytes';

export class UsageDto {
  @ApiProperty()
  size: string;

  @ApiProperty()
  sizePretty: string;

  constructor(sum: string) {
    Object.assign(this, {
      size: sum,
      sizePretty: prettyBytes(parseFloat(sum)),
    });
  }
}
