import io from 'socket.io-client';
import { wsexcelSocketInit } from 'src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ImportDataFromExcel';
import { wsexcelbatchSocketInit } from 'src/pages/worksheet/components/DialogImportExcelCreate/index.js';
import workflowSocketInit from 'src/pages/workflow/socket';
import worksheetSocket from 'worksheet/components/socket';
import appSocketInit from 'src/pages/Admin/appManagement/socket';
import exportPivotTableSocket from 'statistics/components/socket';
import customNotice from './customNotice';
import { getPssId } from 'src/util/pssId';
import { notification } from 'antd';

export const socketInit = () => {
  if (window.IM === undefined) {
    window.IM = {};
    const socket = io.connect(window.config.SERVER_NAME, {
      path: '/mds2',
      reconnectionAttempts: 100,
      timeout: 15000,
      query: {
        pss_id: getPssId(),
      },
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

  wsexcelbatchSocketInit();
};
