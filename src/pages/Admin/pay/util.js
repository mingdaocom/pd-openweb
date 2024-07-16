import moment from 'moment';

export const formatDate = date => (date ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '-');
