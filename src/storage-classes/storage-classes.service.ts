import { Injectable } from '@nestjs/common';
import { StorageClasses } from '../entities/storage-classes.entity';

@Injectable()
export class StorageClassesService {
  get(): StorageClasses[] {
    const storageClasses = [
      {
        name: `Minimum capacity charge per object`,
        Standard: '128 KB',
        'Intelligent-Tiering': '128 KB',
        'Standard-IA': '1,024 KB',
        'Glacier Instant Retrieval': '10 Mb',
        'Glacier Flexible Retrieval': '10 Mb',
        'Glacier Deep Archive': '10 Mb',
      },
      {
        name: `Minimum storage duration charge`,
        Standard: '30 days',
        'Intelligent-Tiering': '30 days',
        'Standard-IA': '30 days',
        'Glacier Instant Retrieval': '90 days',
        'Glacier Flexible Retrieval': '90 days',
        'Glacier Deep Archive': '180 days',
      },
      {
        name: `Storage fee, per Gb`,
        Standard: '$0.004',
        'Intelligent-Tiering': '$0.0035',
        'Standard-IA': '$0.003',
        'Glacier Instant Retrieval': '$0.002',
        'Glacier Flexible Retrieval': '$0.0017',
        'Glacier Deep Archive': '$0.00099',
      },
      {
        name: `Bandwith fee, per Gb`,
        Standard: '$0.001',
        'Intelligent-Tiering': '$0.001',
        'Standard-IA': '$0.0015',
        'Glacier Instant Retrieval': '$0.037',
        'Glacier Flexible Retrieval': '$0.032',
        'Glacier Deep Archive': '$0.015',
      },
    ];

    return storageClasses;
  }
}
