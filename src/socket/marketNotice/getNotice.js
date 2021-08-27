import axios from 'axios';
import { get } from 'lodash';
import displayMarketNotice from './displayMarketNotice';
import displaySysNotice from './displaySysNotice';
import '../index.less';

export default function getNotice() {
  const { accountId } = get(md, ['global', 'Account']);
  const { MdNoticeServer } = get(md, ['global', 'Config']);
  $.ajax({
    url: `${MdNoticeServer}/notice/getUnread?accountId=${accountId}&types=1&types=3`,
    dataType: 'jsonp',
    timeout: 3000,
    jsonp: 'jsoncallback',
    success: function(payload) {
      if (payload.state === 1) {
        const { data = [] } = payload;
        if (Array.isArray(data) && data.length > 0) {
          data.forEach(({ data: notice }) => {
            if ([1, 2].includes(notice.type)) {
              displaySysNotice(notice);
              return;
            }
            displayMarketNotice(notice);
          });
        }
      } else {
        console.log(payload);
      }
    },
    error: console.error,
  });
}
