import { antNotification } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import { emitter } from '../index';

const TYPES = {
  1: _l('应用结构'),
  2: _l('工作表'),
  3: _l('角色'),
  4: _l('工作流'),
  5: _l('文件处理'),
};
export default () => {
  IM.socket.on('mdy_export', ({ state, type, apps = [], id, index, totalIndex }) => {
    let message = '';
    let description = '';
    let action = '';
    let duration = null;
    if (state === 1) {
      description = _l('这可能需要一段时间，现在您可以进行其他操作，导出完成后通知您');
      action = 'info';
      if (type === 5) {
        message = _l('正在生成文件... ( %0/%1 )', index, totalIndex);
      } else {
        message = _l('正在导出%0... ( %1/%2 )', TYPES[type], index, totalIndex);
      }
    } else if (state === 2) {
      const appNames = apps.map(item => item.name).join('、');
      message = _l('导出成功');
      description = _l('成功导出%0个应用：%1。请尽快下载，下载链接于30天后失效', apps.length, appNames);
      action = 'success';
      duration = 5;
    } else {
      message = _l('导出失败');
      description = _l('%0导出时异常，请重新导出', TYPES[type]);
      action = 'error';
      duration = 5;
    }

    antNotification[action]({
      key: id,
      duration,
      message,
      description,
      loading: state === 1,
      btnText: state === 2 ? _l('立即下载') : '',
      onBtnClick: () => {
        window.open(`${__api_server__.main}Download/AppFile?sourceId=${id}`);
        antNotification.close(id);
      },
    });
  });

  IM.socket.on('mdy_import', ({ state, type, apps = [], id, index, totalIndex }) => {
    let message = '';
    let description = '';
    let action = '';
    let duration = null;
    if (state === 4) {
      description = _l('这可能需要一段时间，现在您可以进行其他操作，导入完成后通知您');
      action = 'info';
      message = _l('正在导入%0... ( %1/%2 )', TYPES[type], index, totalIndex);
    } else if (state === 5) {
      const appNames = apps.map(item => item.name).join('、');
      message = _l('导入成功');
      description = _l('成功导入%0个应用：%1。', apps.length, appNames);
      action = 'success';
      duration = 5;
      emitter.emit('updateState');
    } else {
      message = _l('导入失败');
      description = _l('%0导入异常，请重新导入', TYPES[type]);
      action = 'error';
      duration = 5;
    }

    antNotification[action]({
      key: id,
      duration,
      message,
      description,
      loading: state === 4,
      btnText: state === 5 && apps.length === 1 ? _l('打开应用') : '',
      onBtnClick: () => {
        navigateTo(`/app/${_.get(apps[0], 'appId')}`);
        antNotification.close(id);
      },
    });
  });
};
