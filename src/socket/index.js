import { notification } from 'antd';
import io from 'socket.io-client';
import exportPivotTableSocket from 'statistics/components/socket';
import worksheetSocket from 'worksheet/components/socket';
import appSocketInit from 'src/pages/Admin/app/appManagement/socket';
import appManageSocket from 'src/pages/AppSettings/components/socket';
import workflowSocketInit from 'src/pages/workflow/socket';
import { wsexcelSocketInit } from 'src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ImportDataFromExcel';
import { wsexcelbatchSocketInit } from 'src/pages/worksheet/components/DialogImportExcelCreate/index.js';
import { getPssId } from 'src/utils/pssId';
import customNotice from './customNotice';
import marketNotice from './marketNotice';
import getNotice from './marketNotice/getNotice';

export const socketInit = () => {
  if (window.IM === undefined) {
    window.IM = {};
    const server = _.get(window, 'config.SERVER_NAME');
    const socket = io.connect(server, {
      path: '/mds2',
      reconnectionAttempts: 100,
      timeout: 15000,
      query:
        !md.global.Config.IsLocal ||
        window.top !== window.self ||
        md.global.Config.IsMultiMds2 ||
        location.href.indexOf('localhost') > -1
          ? { pss_id: getPssId() }
          : {}, // 非私有部署 或 Iframe 或 mds2 多域名 下，走 Url 参数
      transports: window.config.SocketPolling ? ['polling', 'websocket'] : ['websocket'],
    });
    window.IM.socket = socket;
  }
};

export default () => {
  notification.config({
    maxCount: 3,
  });
  // socket 初始化
  socketInit();

  // 未初始化不监听事件
  if (window.IM === undefined) return;

  // 自定义按钮监听
  worksheetSocket();
  // 工作表导入行记录
  wsexcelSocketInit();
  // 工作流推送
  workflowSocketInit();
  // 导出应用
  !md.global.Account.isPortal && appSocketInit();
  // 透视表导出
  exportPivotTableSocket();
  // 自定义通知
  customNotice();

  // 应用备份/应用升级
  appManageSocket();

  wsexcelbatchSocketInit();
};
