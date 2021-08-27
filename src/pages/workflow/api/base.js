export const controllerName = 'Workflow';
import { getPssId } from 'src/util/pssId';

export default {
  server: () => md.global.Config.WorkFlowUrl,
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
