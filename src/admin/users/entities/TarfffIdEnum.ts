export enum TariffIdEnum {
  'PayAsYouGo' = 0,
  'Business' = 1,
  'Enterprice' = 2,
  'PayAsYouGo[dev]' = 3,
  'Business[dev]' = 4,
  'Enterprice[dev]' = 5,
}

export const TariffIdsTuple = [
  TariffIdEnum.PayAsYouGo,
  TariffIdEnum.Business,
  TariffIdEnum.Enterprice,
  TariffIdEnum['PayAsYouGo[dev]'],
  TariffIdEnum['Business[dev]'],
  TariffIdEnum['Enterprice[dev]'],
];
