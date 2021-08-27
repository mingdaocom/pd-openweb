export const controllerName = 'Worksheet';
import { getPssId } from 'src/util/pssId';

export default {
  // server: () => 'http://172.16.0.87:8086',
  server: () => md.global.Config.WsReportUrl,
  ajaxOptions: {
    url: '',
    type: 'Get',
    cache: false,
    dataType: 'json',
    contentType: 'application/json',
    beforeSend(xhr) {
      xhr.setRequestHeader('md_pss_id', getPssId());
    },
  },
};
