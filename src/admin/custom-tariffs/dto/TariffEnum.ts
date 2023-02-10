export enum TariffIdEnum {
  'PayAsYouGo' = 0,
  'Business' = 1,
  'Enterprice' = 2,
  'PayAsYouGo[dev]' = 3,
  'Business[dev]' = 4,
  'Enterprice[dev]' = 5,
  'Corporate' = 6,
  'Corporate[dev]' = 7,
}

export const TariffIdsTuple = [
  TariffIdEnum.PayAsYouGo,
  TariffIdEnum.Business,
  TariffIdEnum.Enterprice,
  TariffIdEnum['PayAsYouGo[dev]'],
  TariffIdEnum['Business[dev]'],
  TariffIdEnum['Enterprice[dev]'],
  TariffIdEnum.Corporate,
  TariffIdEnum['Corporate[dev]'],
];
