import { notification } from 'ming-ui/antd-components';
import exportPivotTableSocket from 'statistics/components/socket';
import worksheetSocket from 'worksheet/components/socket';
import appSocketInit from 'src/pages/Admin/app/appManagement/socket';
import knowledgeSocketInit from 'src/pages/AppSettings/components/Knowledge/socket';
import appManageSocket from 'src/pages/AppSettings/components/socket';
import workflowSocketInit from 'src/pages/workflow/socket';
import { wsexcelSocketInit } from 'src/pages/worksheet/common/WorksheetBody/ImportDataFromExcel/ImportDataFromExcel';
import { wsexcelbatchSocketInit } from 'src/pages/worksheet/components/DialogImportExcelCreate/socketHandlers/wsexcelbatch';
import { createSocketConnection } from './connection';
import customNotice from './customNotice';

export const socketInit = () => {
  createSocketConnection();
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
  // 知识库推送
  knowledgeSocketInit();

  wsexcelbatchSocketInit();
};
