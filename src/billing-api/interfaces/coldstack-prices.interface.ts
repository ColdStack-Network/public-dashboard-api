export interface ColdstackPriceForStorageClass {
  download: string;

  storage: string;
}

export interface ColdstackPrices {
  standard: ColdstackPriceForStorageClass;
  intelligentTiering: ColdstackPriceForStorageClass;
  standardIA: ColdstackPriceForStorageClass;
  glacier: ColdstackPriceForStorageClass;
  deepArchive: ColdstackPriceForStorageClass;
}
