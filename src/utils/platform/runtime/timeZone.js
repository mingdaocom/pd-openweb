import moment from 'moment';

/** 返回服务器默认时区与当前用户时区的分钟偏移量。 */
export const getTimeZone = () => {
  const serverZone = md.global.Config.DefaultTimeZone;
  const userZone = md.global.Account.timeZone === 1 ? new Date().getTimezoneOffset() * -1 : md.global.Account.timeZone;

  return { serverZone, userZone };
};

/** 将服务器时区的日期时间转换为当前用户时区文本。 */
export const dateConvertToUserZone = date => {
  if (!date) return '';

  const { serverZone, userZone } = getTimeZone();

  return moment(date)
    .add(userZone - serverZone, 'm')
    .format('YYYY-MM-DD HH:mm:ss');
};

/** 将当前用户时区的日期时间转换为服务器时区文本。 */
export const dateConvertToServerZone = date => {
  if (!date) return '';

  const { serverZone, userZone } = getTimeZone();

  return moment(date)
    .add(serverZone - userZone, 'm')
    .format('YYYY-MM-DD HH:mm:ss');
};

/** 将应用时区的日期时间转换为服务器时区文本。 */
export const dateAppZoneToServerZone = (date, appTimeZone) => {
  if (!date) return '';
  if (!appTimeZone) return date;

  const { serverZone } = getTimeZone();

  return moment(date)
    .add(serverZone - appTimeZone, 'm')
    .format('YYYY-MM-DD HH:mm:ss');
};

/** 将服务器时区的日期时间转换为应用时区文本。 */
export const dateServerZoneToAppZone = (date, appTimeZone) => {
  if (!date) return '';
  if (!appTimeZone) return date;

  const { serverZone } = getTimeZone();

  return moment(date)
    .add(appTimeZone - serverZone, 'm')
    .format('YYYY-MM-DD HH:mm:ss');
};
