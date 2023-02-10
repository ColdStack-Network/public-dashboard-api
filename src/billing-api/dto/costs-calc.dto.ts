import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CostsEstimatorInputsForStorageClassAndService {
  @ApiProperty()
  available: boolean;

  @ApiPropertyOptional({
    type: 'array',
    items: {
      properties: {
        fromTb: { type: 'number' },
        toTb: { type: 'number', nullable: true },
        price: { type: 'number' },
      },
    },
  })
  storage?: {
    fromTb: number;
    toTb: number | null;
    price: number;
  }[];

  @ApiPropertyOptional({
    type: 'array',
    items: {
      properties: {
        fromTb: { type: 'number' },
        toTb: { type: 'number', nullable: true },
        price: { type: 'number' },
      },
    },
  })
  download?: {
    fromTb: number;
    toTb: number | null;
    price: number;
  }[];
}

export class CostsEstimatorInputsForStorageClass {
  @ApiProperty({ type: () => CostsEstimatorInputsForStorageClassAndService })
  coldstack: CostsEstimatorInputsForStorageClassAndService;

  @ApiProperty({ type: () => CostsEstimatorInputsForStorageClassAndService })
  amazonS3: CostsEstimatorInputsForStorageClassAndService;

  @ApiProperty({ type: () => CostsEstimatorInputsForStorageClassAndService })
  googleCloud: CostsEstimatorInputsForStorageClassAndService;

  @ApiProperty({ type: () => CostsEstimatorInputsForStorageClassAndService })
  azureStorage: CostsEstimatorInputsForStorageClassAndService;
}

export class CostsEstimatorInputs {
  @ApiProperty({ type: () => CostsEstimatorInputsForStorageClass })
  standard: CostsEstimatorInputsForStorageClass;

  @ApiProperty({ type: () => CostsEstimatorInputsForStorageClass })
  intelligentTiering: CostsEstimatorInputsForStorageClass;

  @ApiProperty({ type: () => CostsEstimatorInputsForStorageClass })
  standardIA: CostsEstimatorInputsForStorageClass;

  @ApiProperty({ type: () => CostsEstimatorInputsForStorageClass })
  glacier: CostsEstimatorInputsForStorageClass;

  @ApiProperty({ type: () => CostsEstimatorInputsForStorageClass })
  deepArchive: CostsEstimatorInputsForStorageClass;

  constructor(data: CostsEstimatorInputs) {
    Object.assign(this, data);
  }
}
