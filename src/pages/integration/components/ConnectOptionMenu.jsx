import React from 'react';
import { useSetState } from 'react-use';
import { Icon } from 'ming-ui';
import { Dropdown, Modal } from 'ming-ui/antd-components';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import { useExportDialog } from '../apiIntegration/ConnectWrap/content/Export';
import { useUpgradeDialog } from '../apiIntegration/ConnectWrap/content/Upgrade';
import { usePublishDialog } from './PublishDialog';

function ConnectOptionMenu(props) {
  const {
    connectData = {},
    currentProjectId,
    hasManageAuth,
    onCopySuccess,
    onDeleteSuccess,
    onUpgradeSuccess,
    placement = 'bottomRight',
    trigger,
  } = props;

  const { id, isOwner, name, hasAuth, status, info, type } = connectData;
  const isConnectOwner = hasManageAuth || isOwner;

  const [{ popupVisible }, setState] = useSetState({
    popupVisible: false,
  });
  const { open: openExportDialog, holder: exportDialogHolder } = useExportDialog();
  const { open: openUpgradeDialog, holder: upgradeDialogHolder } = useUpgradeDialog();
  const { open: openPublishDialog, holder: publishDialogHolder } = usePublishDialog();

  // 如果没有权限，不显示菜单
  if (!isConnectOwner && !hasAuth) {
    return '';
  }

  const isAuthorizedFromOther = !isOwner && hasAuth; // 授权来的连接
  //非私有部署或nocoly-saas环境有上架  只有自建的连接才有上架
  const showPublish = !window.platformENV.isLocal && type === 1 && !isAuthorizedFromOther && isConnectOwner;
  const showUpgrade = !isAuthorizedFromOther && isConnectOwner; // 非授权连接有权限就可以导入
  const showExport = type === 1 && !isAuthorizedFromOther && isConnectOwner; //自建的连接
  const showCopy = type === 1 && !isAuthorizedFromOther && isConnectOwner; //自建的连接

  const stopPropagation = domEvent => domEvent.stopPropagation();

  // 删除连接
  const onDel = () => {
    const AjaxFetch = isAuthorizedFromOther
      ? packageVersionAjax.unInstall({ id, companyId: currentProjectId }, { isIntegration: true })
      : packageVersionAjax.delete({ id }, { isIntegration: true });

    AjaxFetch.then(res => {
      if (res) {
        alert(_l('删除成功'));
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else {
        alert(_l('有API被引用，请删除引用后重试'), 3);
      }
    });
  };

  // 复制连接
  const onCopy = () => {
    packageVersionAjax.copy({ id }, { isIntegration: true }).then(res => {
      if (res) {
        onCopySuccess && onCopySuccess();
        alert(_l('复制成功'));
      } else {
        alert(_l('复制失败，请稍后重试'), 3);
      }
    });
  };

  const menuItems = [
    showPublish && {
      key: 'publish',
      icon: <Icon icon="publish" className="Font17" />,
      label: status === 3 || info ? _l('申请上架新版本') : _l('申请上架到API库'),
      onClick: ({ domEvent }) => {
        stopPropagation(domEvent);
        openPublishDialog({
          currentProjectId,
          id,
          hasManageAuth,
        });
      },
    },
    showUpgrade && {
      key: 'upgrade',
      icon: <Icon icon="upload_file" className="Font17" />,
      label: _l('导入升级'),
      onClick: ({ domEvent }) => {
        stopPropagation(domEvent);
        openUpgradeDialog({
          projectId: currentProjectId,
          info: connectData,
          onUpgrade: () => {
            onUpgradeSuccess && onUpgradeSuccess();
          },
        });
      },
    },
    showExport && {
      key: 'export',
      icon: <Icon icon="cloud_download" className="Font17" />,
      label: _l('导出'),
      onClick: ({ domEvent }) => {
        stopPropagation(domEvent);
        openExportDialog({
          info: connectData,
          projectId: currentProjectId,
        });
      },
    },
    showCopy && {
      key: 'copy',
      icon: <Icon icon="copy" className="Font17" />,
      label: _l('复制'),
      onClick: ({ domEvent }) => {
        stopPropagation(domEvent);
        Modal.confirm({
          title: _l('复制“%0”连接', name),
          width: 500,
          content: _l('将复制目标连接的所有配置信息'),
          okText: _l('复制'),
          onOk: onCopy,
        });
      },
    },
    {
      key: 'delete',
      danger: true,
      icon: <Icon icon="trash" className="Font17" />,
      label: _l('删除'),
      onClick: ({ domEvent }) => {
        stopPropagation(domEvent);
        Modal.confirm({
          title: (
            <span className="Red textError">{isAuthorizedFromOther ? _l('确认删除') : _l('删除“%0”连接', name)}</span>
          ),
          okButtonProps: {
            danger: true,
          },
          width: 500,
          content: isAuthorizedFromOther
            ? _l('删除连接后，连接下授权的账户信息也会被删除。')
            : _l('删除后将不可恢复，确认删除吗？'),
          onOk: onDel,
        });
      },
    },
  ].filter(Boolean);

  return (
    <>
      {exportDialogHolder}
      {upgradeDialogHolder}
      {publishDialogHolder}
      <Dropdown
        trigger={['click']}
        open={popupVisible}
        onOpenChange={popupVisible => setState({ popupVisible })}
        placement={placement}
        menu={{ items: menuItems, style: { width: 200 } }}
      >
        {trigger}
      </Dropdown>
    </>
  );
}

export default ConnectOptionMenu;
