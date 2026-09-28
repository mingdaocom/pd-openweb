import moment from 'moment';

const INVITE_COLORS = {
  0: 'var(--color-error)',
  1: '#9c27b0',
  2: '#795548',
  3: 'var(--color-warning)',
  4: 'var(--color-primary)',
  5: 'var(--color-success)',
  6: 'var(--color-yellow)',
  99: 'var(--color-success)',
  100: 'var(--color-yellow)',
};

export const getCategoryColorClass = color => {
  const classes = [
    'iconTickRed',
    'iconTickViolet',
    'iconTickBrown',
    'iconTickOrange',
    'iconTickBlue',
    'iconTickGreen',
    'iconTickYellow',
  ];
  return classes[color] || classes[4];
};

export const getInviteColor = color => {
  return INVITE_COLORS[color] || INVITE_COLORS[4];
};

export const formatInviteData = (start, end, isAllDay) => {
  const startTime = moment(start);
  const endTime = moment(end);
  const isSameDay = startTime.isSame(endTime, 'day');

  if (isAllDay) {
    return isSameDay
      ? `${startTime.format(_l('MM月DD日 (ddd)'))} (${_l('全天')})`
      : `${startTime.format(_l('MM月DD日 (ddd)'))} - ${endTime.format(_l('MM月DD日 (ddd)'))} (${_l('全天')})`;
  }

  return isSameDay
    ? `${startTime.format(_l('MM月DD日 (ddd) HH:mm'))} - ${endTime.format('HH:mm')}`
    : `${startTime.format(_l('MM月DD日 (ddd) HH:mm'))} - ${endTime.format(_l('MM月DD日 (ddd) HH:mm'))}`;
};
