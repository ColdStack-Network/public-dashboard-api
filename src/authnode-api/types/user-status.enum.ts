export enum UserStatus {
  /**
   * Пользователь в триальном периоде, полный доступ к файлам и дашборду
   */
  Trial = 'trial',

  /**
   * Все нормально с пользователем, у него есть подтвержденная карта, полный доступ к файлам и дашборду
   */
  Active = 'active',

  /**
   * За неделю до окончания билингового периода, полный доступ к файлам и дашборду
   */
  Expired = 'expired',

  /**
   * Пользователь может продолжать использовать сервис, при посещении дашборда отображаем
   * перетяжку (информационная строка-полоска) с просьбой обновить карты/пополнить баланс
   * карты. Полный доступ к файлам и дашборду
   */
  PaymentRequired = 'payment_required',

  /**
   * Пользователь отписался от тарифа, до конца оплаченного периода полный доступ и если
   * не подпишется снова, переводим в состояние blocked и далее в deleted
   */
  Unsubscribed = 'unsubscribed',

  /**
   * Есть только возможность просмотра файлов, но нет доступа к загрузке/выгрузке файлов.
   * При попытке загрузки/выгрузки файлов с помощью s3 client выводим сообщение об этом.
   * Отображаем перетяжку с информацией об этом на дашборде
   */
  Suspended = 'suspended',

  /**
   * Аккаунт заблокирован, нет доступ ни к чему, при переходе на дашборд показываем попап
   * с информацией что аккаунт заблокирован (дашборд закрыт) и просьбой связаться по почте.
   * Доступа к файлам у пользователя нет, даже на просмотр. Если коннектся через s3 то выводим
   * сообщение что пользователь заблокирован.
   */
  Blocked = 'blocked',

  /**
   * Аккаунт удален, данные удалены, больше с этим емайлом нельзя зарегистрироваться
   */
  Deleted = 'deleted',
}
