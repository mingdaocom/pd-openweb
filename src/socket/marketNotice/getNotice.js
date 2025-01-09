import { get } from 'lodash';
import displayMarketNotice from './displayMarketNotice';
import displaySysNotice from './displaySysNotice';
import '../index.less';

export default function getNotice() {
  const { accountId } = get(md, ['global', 'Account']);
  const { MdNoticeServer } = get(md, ['global', 'Config']);
  window.mdyAPI('', '', {}, {
    customParseResponse: true,
    ajaxOptions: {
      type: 'GET',
      url: `${MdNoticeServer}/notice/getUnread?accountId=${accountId}&types=1&types=3`
    }
  }).then(payload => {
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
  });
}
