import React from 'react';
import { Icon, antNotification } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';

const getAction = status => {
  switch (status) {
    case 1:
      return 'info';
    case 2:
      return 'success';
    case 3:
      return 'warning';
    default:
      return 'error';
  }
};

const getCommon = ({ id, title, msg, status }) => {
  return {
    key: id,
    className: 'customNotification',
    closeIcon: <Icon icon="close" className="Font20 Gray_9d ThemeHoverColor3" />,
    duration: 5,
    message: title,
    description: <div dangerouslySetInnerHTML={{ __html: msg }} />,
    loading: status === 1,
  };
};

let timeout = null;

export default () => {
  if (!window.IM) return;
  IM.socket.on('backup_app', data => {
    const { id, status, appId, projectId } = data;
    let action = getAction(status);
    const isPageBackup = location.href.indexOf(`/app/${appId}/settings/backup`) > -1;
    const url = status === 2 ? `/app/${appId}/settings/backup` : `/admin/expansionservice/${projectId}/storage`;

    antNotification[action]({
      ...getCommon(data),
      btn: _.includes([2, 3], status) ? (
        <span
          className="Hand ThemeColor"
          onClick={() => {
            if (isPageBackup) {
              location.reload();
            } else {
              navigateTo(url);
            }
          }}
        >
          {status === 2 ? _l('查看') : _l('购买扩容包')}
        </span>
      ) : undefined,
      onBtnClick: () => {
        antNotification.close(id);
      },
    });
  });

  IM.socket.on('upgrade_app', result => {
    const { id, appId, status, appName } = result;
    let title = status === 1 ? _l('应用正在导入升级中...') : status === 2 ? _l('导入升级完成') : _l('导入升级失败');
    let msg =
      status === 1
        ? _l(`应用“${appName}”正在导入升级，完成后会通知您`)
        : status === 2
        ? _l(`应用“${appName}”导入升级完成`)
        : _l(`应用“${appName}”导入升级失败`);
    let action = getAction(status);

    antNotification[action]({
      ...getCommon({ id, title, msg, status }),
      onBtnClick: () => {
        antNotification.close(id);
      },
    });

    if (status === 2 && location.href.includes(`app/${appId}`)) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        location.href = `/app/${appId}`;
      }, 500);
    }
  });
};
