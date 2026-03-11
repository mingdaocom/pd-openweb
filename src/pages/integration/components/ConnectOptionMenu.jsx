import React from 'react';
import { useSetState } from 'react-use';
import Trigger from 'rc-trigger';
import { Dialog, Icon } from 'ming-ui';
import packageVersionAjax from 'src/pages/workflow/api/packageVersion';
import exportDialog from '../apiIntegration/ConnectWrap/content/Export';
import upgradeDialog from '../apiIntegration/ConnectWrap/content/Upgrade';
import { MenuItemWrap, MenuWrap, RedMenuItemWrap } from '../apiIntegration/style';
import publishDialog from './PublishDialog';

function ConnectOptionMenu(props) {
  const {
    connectData = {},
    currentProjectId,
    hasManageAuth,
    onCopySuccess,
    onDeleteSuccess,
    onUpgradeSuccess,
    popupAlign,
    trigger,
  } = props;

  const { id, isOwner, name, hasAuth, status, info, type } = connectData;
  const isConnectOwner = hasManageAuth || isOwner;

  const [{ popupVisible }, setState] = useSetState({
    popupVisible: false,
  });

  // 如果没有权限，不显示菜单
  if (!isConnectOwner && !hasAuth) {
    return '';
  }
  const isAuthorizedFromOther = !isOwner && hasAuth; // 授权来的连接

  const showPublish =
    !window.platformENV.isOverseas &&
    !window.platformENV.isLocal &&
    type === 1 &&
    !isAuthorizedFromOther &&
    isConnectOwner; //私有部署没有上架  只有自建的连接才有上架
  const showUpgrade = !isAuthorizedFromOther && isConnectOwner; // 非授权连接有权限就可以导入
  const showExport = type === 1 && !isAuthorizedFromOther && isConnectOwner; //自建的连接
  const showCopy = type === 1 && !isAuthorizedFromOther && isConnectOwner; //自建的连接

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

  return (
    <React.Fragment>
      <Trigger
        action="click"
        popupVisible={popupVisible}
        onPopupVisibleChange={popupVisible => setState({ popupVisible })}
        popupAlign={popupAlign}
        popup={
          <MenuWrap>
            {/* 申请上架到API库/申请上架新版本 */}
            {showPublish && (
              <MenuItemWrap
                icon={<Icon icon="publish" className="Font17 mLeft5" />}
                onClick={e => {
                  e.stopPropagation();
                  setState({ popupVisible: false });
                  publishDialog({
                    currentProjectId,
                    id,
                    hasManageAuth: hasManageAuth,
                  });
                }}
              >
                <span>{status === 3 || info ? _l('申请上架新版本') : _l('申请上架到API库')}</span>
              </MenuItemWrap>
            )}
            {/* 导入升级 */}
            {showUpgrade && (
              <MenuItemWrap
                icon={<Icon icon="upload_file" className="Font17 mLeft5" />}
                onClick={e => {
                  e.stopPropagation();
                  setState({ popupVisible: false });
                  upgradeDialog({
                    projectId: currentProjectId,
                    info: connectData,
                    onUpgrade: () => {
                      onUpgradeSuccess && onUpgradeSuccess();
                    },
                  });
                }}
              >
                <span>{_l('导入升级')}</span>
              </MenuItemWrap>
            )}
            {/* 导出 */}
            {showExport && (
              <MenuItemWrap
                icon={<Icon icon="cloud_download" className="Font17 mLeft5" />}
                onClick={e => {
                  e.stopPropagation();
                  setState({ popupVisible: false });
                  exportDialog({
                    info: connectData,
                    projectId: currentProjectId,
                  });
                }}
              >
                <span>{_l('导出')}</span>
              </MenuItemWrap>
            )}
            {/* 复制连接 */}
            {showCopy && (
              <MenuItemWrap
                icon={<Icon icon="copy" className="Font17 mLeft5" />}
                onClick={e => {
                  e.stopPropagation();
                  setState({ popupVisible: false });

                  Dialog.confirm({
                    title: _l('复制“%0”连接', name),
                    width: 500,
                    description: _l('将复制目标连接的所有配置信息'),
                    okText: _l('复制'),
                    onOk: onCopy,
                  });
                }}
              >
                {_l('复制')}
              </MenuItemWrap>
            )}
            {/* 删除连接 */}
            <RedMenuItemWrap
              icon={<Icon icon="trash" className="Font17 mLeft5" />}
              onClick={e => {
                e.stopPropagation();
                setState({ popupVisible: false });

                Dialog.confirm({
                  title: (
                    <span className="Red">{isAuthorizedFromOther ? _l('确认删除') : _l('删除“%0”连接', name)}</span>
                  ),
                  buttonType: 'danger',
                  width: 500,
                  description: isAuthorizedFromOther
                    ? _l('删除连接后，连接下授权的账户信息也会被删除。')
                    : _l('删除后将不可恢复，确认删除吗？'),
                  onOk: onDel,
                });
              }}
            >
              {_l('删除')}
            </RedMenuItemWrap>
          </MenuWrap>
        }
      >
        {trigger}
      </Trigger>
    </React.Fragment>
  );
}

export default ConnectOptionMenu;
