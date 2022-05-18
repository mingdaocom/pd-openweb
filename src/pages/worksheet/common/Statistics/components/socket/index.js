import { antNotification } from 'ming-ui';
import { addToken } from 'src/util';

export default () => {
  IM.socket.on('report_export', ({ status, reportId, reportName, downloadUrl }) => {
    let message = '';
    let description = '';
    let action = '';
    let duration = null;
    if (status === 1) {
      action = 'info';
      message = _l('正在导出数据 “%0”', reportName);
      description = _l('这可能需要一段时间，现在您可以进行其他操作，全部导出完成将后通知您');
    } else if (status === 2) {
      action = 'success';
      message = _l('导出文件准备完成');
      description = _l('“%0” 导出文件已准备完成，文件下载链接将于24小时失效，请尽快下载', reportName);
      duration = 5;
    } else {
      action = 'error';
      message = _l('导出数据 “%0” 失败', reportName);
      duration = 5;
    }

    antNotification[action]({
      key: reportId,
      duration,
      message,
      description,
      loading: status === 1,
      btnText: status === 2 ? _l('立即下载') : '',
      onBtnClick: () => {
        window.open(addToken(downloadUrl, !window.isDingTalk));
        antNotification.close(reportId);
      }
    });
  });
}
