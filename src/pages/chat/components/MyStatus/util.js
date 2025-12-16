import moment from 'moment';

export const formatDateShow = date => {
  const hm = moment(date).format('HH:mm');
  const hideHm = hm === '00:00' || hm === '23:59'; // 时间为00:00或23:59时，不显示时分

  if (moment().isSame(date, 'day')) {
    // 今天
    return hideHm ? _l('今天') : _l('今天 %0', hm);
  } else if (moment().add(1, 'd').isSame(date, 'day')) {
    // 明天
    return hideHm ? _l('明天') : _l('明天 %0', hm);
  } else if (moment().isSame(date, 'year')) {
    // 今年
    return hideHm ? moment(date).format(_l('MM月DD日')) : moment(date).format(_l('MM月DD日 HH:mm'));
  }

  return hideHm ? moment(date).format(_l('YYYY年MM月DD日')) : moment(date).format(_l('YYYY年MM月DD日 HH:mm'));
};
