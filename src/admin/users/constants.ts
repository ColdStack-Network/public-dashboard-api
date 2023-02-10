// eslint-disable-next-line
export const PASSWORD_REGEX =
  /^(.*(?=.{8,})(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[`~!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*){8,}$/;

export const PASSWORD_REGEX_MESSAGE =
  'Password must contain at least 1 Сapital character, 1 lowercase character, 1 number, 1 special symbol and be at least 8 characters long';

export const BUSINESS_EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@(?!gmail.com)(?!yahoo.com)(?!hotmail.com)(?!yahoo.co.in)(?!aol.com)(?!live.com)(?!outlook.com)[a-zA-Z0-9_-]+.[a-zA-Z0-9-.]{2,61}$/;

export const BUSINESS_EMAIL_MESSAGE = 'Please enter business email';

export const DATA_VOLUME_LIST = [
  'Less than 50 TB',
  '50 - 100 TB',
  '100 - 200 TB',
  '200 - 500 TB',
  '500 TB - 1 PB',
  '1 - 20 PB',
  '20+ PB',
];

export const DATA_VOLUME_MESSAGE = `Only such values are acceptable: ${DATA_VOLUME_LIST.join(', ')}`;
