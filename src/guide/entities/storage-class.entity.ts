import { ApiProperty } from '@nestjs/swagger';

export class SuccessUpdateQntitiesApi {
  @ApiProperty({
    example: 200,
    description: 'Status code',
  })
  statusCode: number;

  @ApiProperty({
    example: [{ id: 1, name: 'frequentAccess' }],
    description: 'Response body',
  })
  data: {
    id: number;
    name: string;
  }[];
}
