import { CostsEstimatorInputsForStorageClassAndService } from '../dto/costs-calc.dto';

type CostsEstimatorInputsForStorageClass = {
  amazonS3: CostsEstimatorInputsForStorageClassAndService;
  googleCloud: CostsEstimatorInputsForStorageClassAndService;
  azureStorage: CostsEstimatorInputsForStorageClassAndService;
  coldstack: CostsEstimatorInputsForStorageClassAndService;
};

export const pricesForServices: {
  standard: CostsEstimatorInputsForStorageClass;
  intelligentTiering: CostsEstimatorInputsForStorageClass;
  standardIA: CostsEstimatorInputsForStorageClass;
  glacier: CostsEstimatorInputsForStorageClass;
  deepArchive: CostsEstimatorInputsForStorageClass;
} = {
  standard: {
    coldstack: {
      available: true,
      storage: [{ fromTb: 0, toTb: null, price: 0.004 * 1024 * 12 }],
      download: [{ fromTb: 0, toTb: null, price: 0.001 * 1024 * 12 }],
    },
    amazonS3: {
      available: true,
      storage: [
        { fromTb: 0, toTb: 50, price: 0.023 * 1024 * 12 },
        { fromTb: 50, toTb: 500, price: 0.022 * 1024 * 12 },
        { fromTb: 500, toTb: null, price: 0.021 * 1024 * 12 },
      ],
      download: [
        { fromTb: 0, toTb: 10, price: 0.09 * 1024 * 12 },
        { fromTb: 10, toTb: 50, price: 0.085 * 1024 * 12 },
        { fromTb: 50, toTb: 150, price: 0.07 * 1024 * 12 },
        { fromTb: 150, toTb: null, price: 0.05 * 1024 * 12 },
      ],
    },
    googleCloud: {
      available: true,
      storage: [{ fromTb: 0, toTb: null, price: 0.026 * 1024 * 12 }],
      download: [
        { fromTb: 0, toTb: 1, price: 0.12 * 1024 * 12 },
        { fromTb: 1, toTb: 10, price: 0.11 * 1024 * 12 },
        { fromTb: 10, toTb: null, price: 0.08 * 1024 * 12 },
      ],
    },
    azureStorage: {
      available: true,
      storage: [
        { fromTb: 0, toTb: 50, price: 0.018 * 1024 * 12 },
        { fromTb: 50, toTb: 500, price: 0.0173 * 1024 * 12 },
        { fromTb: 500, toTb: null, price: 0.0166 * 1024 * 12 },
      ],
      download: [
        { fromTb: 0, toTb: 10, price: 0.0875 * 1024 * 12 },
        { fromTb: 10, toTb: 50, price: 0.083 * 1024 * 12 },
        { fromTb: 50, toTb: 150, price: 0.07 * 1024 * 12 },
        { fromTb: 150, toTb: null, price: 0.05 * 1024 * 12 },
      ],
    },
  },
  intelligentTiering: {
    coldstack: {
      available: true,
      storage: [{ fromTb: 0, toTb: null, price: 0.0035 * 1024 * 12 }],
      download: [{ fromTb: 0, toTb: null, price: 0.001 * 1024 * 12 }],
    },
    amazonS3: {
      available: true,
      storage: [
        { fromTb: 0, toTb: 50, price: 0.023 * 1024 * 12 },
        { fromTb: 50, toTb: 500, price: 0.022 * 1024 * 12 },
        { fromTb: 500, toTb: null, price: 0.021 * 1024 * 12 },
      ],
      download: [
        { fromTb: 0, toTb: 10, price: 0.09 * 1024 * 12 },
        { fromTb: 10, toTb: 50, price: 0.085 * 1024 * 12 },
        { fromTb: 50, toTb: 150, price: 0.07 * 1024 * 12 },
        { fromTb: 150, toTb: null, price: 0.05 * 1024 * 12 },
      ],
    },
    googleCloud: {
      available: false,
    },
    azureStorage: {
      available: false,
    },
  },
  standardIA: {
    coldstack: {
      available: true,
      storage: [{ fromTb: 0, toTb: null, price: 0.003 * 1024 * 12 }],
      download: [{ fromTb: 0, toTb: null, price: 0.0015 * 1024 * 12 }],
    },
    amazonS3: {
      available: true,
      storage: [{ fromTb: 0, toTb: null, price: 0.0125 * 1024 * 12 }],
      download: [
        { fromTb: 0, toTb: 10, price: 0.09 * 1024 * 12 },
        { fromTb: 10, toTb: 50, price: 0.085 * 1024 * 12 },
        { fromTb: 50, toTb: 150, price: 0.07 * 1024 * 12 },
        { fromTb: 150, toTb: null, price: 0.05 * 1024 * 12 },
      ],
    },
    googleCloud: {
      available: true,
      storage: [{ fromTb: 0, toTb: null, price: 0.01 * 1024 * 12 }],
      download: [
        { fromTb: 0, toTb: 1, price: 0.13 * 1024 * 12 },
        { fromTb: 1, toTb: 10, price: 0.12 * 1024 * 12 },
        { fromTb: 10, toTb: null, price: 0.09 * 1024 * 12 },
      ],
    },
    azureStorage: {
      available: false,
    },
  },
  glacier: {
    coldstack: {
      available: true,
      storage: [{ fromTb: 0, toTb: null, price: 0.002 * 1024 * 12 }],
      download: [{ fromTb: 0, toTb: null, price: 0.0037 * 1024 * 12 }],
    },
    amazonS3: {
      available: true,
      storage: [{ fromTb: 0, toTb: null, price: 0.004 * 1024 * 12 }],
      download: [
        { fromTb: 0, toTb: 10, price: 0.09 * 1024 * 12 },
        { fromTb: 10, toTb: 50, price: 0.085 * 1024 * 12 },
        { fromTb: 50, toTb: 150, price: 0.07 * 1024 * 12 },
        { fromTb: 150, toTb: null, price: 0.05 * 1024 * 12 },
      ],
    },
    googleCloud: {
      available: true,
      storage: [{ fromTb: 0, toTb: null, price: 0.007 * 1024 * 12 }],
      download: [
        { fromTb: 0, toTb: 1, price: 0.14 * 1024 * 12 },
        { fromTb: 1, toTb: 10, price: 0.13 * 1024 * 12 },
        { fromTb: 10, toTb: 0, price: 0.1 * 1024 * 12 },
      ],
    },
    azureStorage: {
      available: false,
    },
  },
  deepArchive: {
    coldstack: {
      available: true,
      storage: [{ fromTb: 0, toTb: null, price: 0.00099 * 1024 * 12 }],
      download: [{ fromTb: 0, toTb: null, price: 0.015 * 1024 * 12 }],
    },
    amazonS3: {
      available: true,
      storage: [{ fromTb: 0, toTb: null, price: 0.00099 * 1024 * 12 }],
      download: [
        { fromTb: 0, toTb: 10, price: 0.09 * 1024 * 12 },
        { fromTb: 10, toTb: 50, price: 0.085 * 1024 * 12 },
        { fromTb: 50, toTb: 150, price: 0.07 * 1024 * 12 },
        { fromTb: 150, toTb: null, price: 0.05 * 1024 * 12 },
      ],
    },
    googleCloud: {
      available: true,
      storage: [{ fromTb: 0, toTb: null, price: 0.004 * 1024 * 12 }],
      download: [
        { fromTb: 0, toTb: 1, price: 0.17 * 1024 * 12 },
        { fromTb: 1, toTb: 10, price: 0.16 * 1024 * 12 },
        { fromTb: 10, toTb: null, price: 0.13 * 1024 * 12 },
      ],
    },
    azureStorage: {
      available: false,
    },
  },
};

/**
 * Amount in cents. e.g. 100 = $1.00
 */
export const CARD_VALIDATION_PRICE = 100;
export const DEFAULT_CURRENCY = 'usd';
