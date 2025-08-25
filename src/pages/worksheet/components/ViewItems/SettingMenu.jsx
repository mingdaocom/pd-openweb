import React, { useState } from 'react';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Icon, Menu, MenuItem } from 'ming-ui';
import { VIEW_DISPLAY_TYPE } from 'worksheet/constants/enum';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { getDefaultViewSet } from 'src/pages/worksheet/constants/common';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import HiddenMenu from './HiddenMenu';
import ViewDisplayMenu from './viewDisplayMenu';

function SettingMenu(props) {
  const {
    isCharge,
    item,
    editName = false,
    changeViewType = false,
    sheetSwitchPermit,
    isLock,
    projectId,
    controls,
    clickEditName,
    onCopy,
    onChangeHidden,
    onRemoveView,
    handleClose,
    onCopyView,
    onOpenView,
    onShare,
    onExport,
    onCopyConfig,
    onExportAttachment,
    changeViewDisplayType,
  } = props;
  const [changeHiddenTypeVisible, setChangeHiddenTypeVisible] = useState(false);
  const [exportVisible, setExportVisible] = useState(false);
  const [changeViewDisplayTypeVisible, setChangeViewDisplayTypeVisible] = useState(false);

  const isDelCustomize = () => {
    const isCustomize = ['customize'].includes(VIEW_DISPLAY_TYPE[item.viewType]);
    return isCustomize && !_.get(item, 'pluginInfo.id');
  };

  const canShare = () => {
    if (isDelCustomize()) {
      return false;
    }

    return (
      !md.global.Account.isPortal &&
      (isOpenPermit(permitList.viewShareSwitch, sheetSwitchPermit, item.viewId) ||
        isOpenPermit(permitList.internalAccessLink, sheetSwitchPermit, item.viewId))
    );
  };

  const canExport = () => {
    if (isDelCustomize()) {
      return false;
    }
    return isOpenPermit(permitList.viewExportSwitch, sheetSwitchPermit, item.viewId);
  };

  const handleExport = it => {
    if (window.isPublicApp) {
      alert(_l('预览模式下，不能操作'), 3);
      return;
    }
    if (it.exportType === 1) {
      onExport(item);
      setExportVisible(false);
      handleClose();
    } else {
      setExportVisible(false);
      handleClose();
      const allowDownload = isOpenPermit(permitList.recordAttachmentSwitch, sheetSwitchPermit, item.viewId);
      const featureType = window.isPublicApp ? '' : getFeatureStatus(projectId, VersionProductType.batchDownloadFiles);
      if (it.exportType === 2 && !allowDownload) {
        return alert(_l('无附件下载权限，无法导出'), 2);
      }
      if (featureType === '2') {
        buriedUpgradeVersionDialog(projectId, VersionProductType.batchDownloadFiles);
        return;
      }
      onExportAttachment();
    }
  };

  const getAttachmentControls = () => {
    return isCharge
      ? controls.filter(it => it.type === 14)
      : controls
          .filter(it => it.type === 14)
          .filter(item => {
            const controlPermissions = item.controlPermissions || '111';
            const fieldPermission = item.fieldPermission || '111';
            return fieldPermission[0] === '1' && controlPermissions[0] === '1';
          });
  };

  const handleChangeViewType = (viewType = 'sheet') => {
    if (viewType !== VIEW_DISPLAY_TYPE[item.viewType]) {
      let advancedSetting = _.omit(item.advancedSetting || {}, [
        'navfilters',
        'groupfilters',
        'groupshow',
        'groupsorts',
        'groupcustom',
        'topfilters',
        'topshow',
        'customitems',
        'customnavs',
        'viewtitle',
        'checkradioid',
        ['detail', 'resource'].includes(viewType) ? 'actioncolumn' : undefined,
      ]);

      if (!['sheet', 'gallery'].includes(viewType)) {
        //转换成非表格和画廊视图，分组配置都清空（包括看板视图）
        advancedSetting = _.omit(advancedSetting, ['groupsetting', 'groupopen', 'groupempty']);
      }

      if (advancedSetting.navshow && _.get(item, 'navGroup[0].controlId')) {
        let control = controls.find(o => o.controlId === _.get(item, 'navGroup[0].controlId')) || {};
        let type = control.type;
        if (type === 30) {
          type = control.sourceControlType;
        }
        advancedSetting.navshow = [26, 27, 48].includes(type) ? '1' : '0';
      }
      changeViewDisplayType(
        getDefaultViewSet({
          ..._.omit(item, ['fastFilters', 'navGroup']),
          viewControl: 'gunter' === viewType ? '' : item.viewControl, //转换成甘特图，viewControl清空
          viewControls: [],
          viewType: VIEW_DISPLAY_TYPE[viewType],
          filters: item.filters, // formatValuesOfOriginConditions(item.filters),
          advancedSetting,
        }),
      );
      if (viewType === 'detail') {
        onOpenView(item);
      }
    }
    setChangeViewDisplayTypeVisible(false);
    handleClose();
  };

  const handleCopyConfig = type => {
    onCopyConfig(item, type);
    handleClose();
  };

  return (
    <Menu className="viewItemMoreOperate" style={{ width: 220 }}>
      {editName && isCharge && (
        <MenuItem data-event="rename" icon={<Icon icon="workflow_write" className="Font18" />} onClick={clickEditName}>
          <span className="text">{_l('重命名%05004')}</span>
        </MenuItem>
      )}
      {!isDelCustomize() && (
        <React.Fragment>
          {!isLock && isCharge && (
            <React.Fragment>
              <MenuItem
                data-event="config"
                icon={<Icon icon="settings" className="Font18" />}
                onClick={() => {
                  onOpenView(item);
                  handleClose();
                }}
              >
                <span className="text">{_l('配置视图%05024')}</span>
              </MenuItem>
              <MenuItem data-event="copyConfigFrom" icon={''} onClick={() => handleCopyConfig(1)}>
                <span className="text">{_l('从其他视图复制')}</span>
              </MenuItem>
              <MenuItem data-event="copyConfigTo" onClick={() => handleCopyConfig(2)}>
                <span className="text">{_l('应用到其他视图')}</span>
              </MenuItem>
            </React.Fragment>
          )}
          {isCharge && <hr className="splitLine" />}
          {changeViewType && !isLock && isCharge && !['customize'].includes(VIEW_DISPLAY_TYPE[item.viewType]) && (
            <Trigger
              popupVisible={changeViewDisplayTypeVisible}
              onPopupVisibleChange={visible => setChangeViewDisplayTypeVisible(visible)}
              popupClassName="DropdownPanelTrigger"
              action={['hover']}
              popupPlacement="bottom"
              popupAlign={{ points: ['tl', 'tr'], offset: [0, -6], overflow: { adjustX: true, adjustY: true } }}
              popup={
                <ViewDisplayMenu
                  style={{
                    borderRadius: '3px',
                  }}
                  viewType={VIEW_DISPLAY_TYPE[item.viewType]}
                  onClick={handleChangeViewType}
                />
              }
            >
              <MenuItem
                data-event="changeType"
                className="changeViewDisplayTypeMenuWrap"
                icon={<Icon icon="swap_horiz" className="Font18" />}
              >
                <span className="text">{_l('更改视图类型%05023')}</span>
                <Icon icon="arrow-right-tip Font15" style={{ fontSize: '16px', right: '10px', left: 'initial' }} />
              </MenuItem>
            </Trigger>
          )}
          {!isLock && isCharge && !['customize'].includes(VIEW_DISPLAY_TYPE[item.viewType]) && (
            <MenuItem
              data-event="copy"
              icon={<Icon icon="content-copy" className="Font18" />}
              onClick={() => {
                onCopyView(item);
                handleClose();
                onCopy && onCopy();
              }}
            >
              <span className="text">{_l('复制%05003')}</span>
            </MenuItem>
          )}
          {/* 分享视图权限 目前只有表视图才能分享*/}
          {canShare() && (
            <MenuItem
              data-event="share"
              icon={<Icon icon="share" className="Font18" />}
              onClick={() => {
                if (window.isPublicApp) {
                  alert(_l('预览模式下，不能操作'), 3);
                  return;
                }
                onShare(item);
                handleClose();
              }}
            >
              <span className="text">{_l('分享%05021')}</span>
            </MenuItem>
          )}
          {/* 导出视图下记录权限 */}
          {canExport() && (
            <Trigger
              popupVisible={exportVisible}
              onPopupVisibleChange={visible => setExportVisible(visible)}
              popupClassName="exportTrigger"
              action={['hover', 'click']}
              popupPlacement="right"
              builtinPlacements={{
                right: { points: ['cl', 'cr'] },
              }}
              popup={
                <Menu style={{ width: 200 }} className="viewItemMoreOperate_subMenu">
                  {[
                    {
                      name: _l('导出记录') + '（Excel，CSV）',
                      icon: 'new_excel',
                      exportType: 1,
                      key: 'exportRecord',
                    },
                    {
                      name: _l('导出附件'),
                      icon: 'attachment',
                      exportType: 2,
                      key: 'exportAttachment',
                    },
                  ].map(it => {
                    if (it.exportType === 2 && _.isEmpty(getAttachmentControls())) return;
                    return (
                      <MenuItem
                        key={it.key}
                        data-event={it.key}
                        icon={<Icon icon={it.icon} />}
                        onClick={() => handleExport(it)}
                      >
                        <span>{it.name}</span>
                      </MenuItem>
                    );
                  })}
                </Menu>
              }
              popupAlign={{ offset: [0, -20] }}
            >
              <MenuItem data-event="export" icon={<Icon icon="download" className="Font18" />}>
                <span className="text">{_l('导出%05020')}</span>
                <Icon icon="arrow-right-tip Font15" style={{ fontSize: '16px', right: '10px', left: 'initial' }} />
              </MenuItem>
            </Trigger>
          )}
        </React.Fragment>
      )}

      {isCharge && (
        <MenuItem
          data-event="hide"
          icon={
            <Icon
              icon={_.get(item, 'advancedSetting.showhide') !== 'hide' ? 'visibility_off' : 'visibility'}
              className="Font18"
            />
          }
          className="hiddenTypeMenuWrap"
          onMouseEnter={() => setChangeHiddenTypeVisible(true)}
          onMouseLeave={() => setChangeHiddenTypeVisible(false)}
        >
          <span className="text">
            {_.get(item, 'advancedSetting.showhide') !== 'hide' ? _l('从导航栏中隐藏%05001') : _l('取消隐藏%05002')}
          </span>
          <Icon icon="arrow-right-tip Font14" style={{ fontSize: '16px', right: '10px', left: 'initial' }} />
          {changeHiddenTypeVisible && (
            <HiddenMenu
              showhide={_.get(item, 'advancedSetting.showhide') || 'show'}
              onClick={onChangeHidden}
              style={{ top: '-6px', left: '100%' }}
            />
          )}
        </MenuItem>
      )}
      {isCharge && (
        <MenuItem
          data-event="delete"
          icon={<Icon icon="hr_delete" className="Font18" />}
          className="delete"
          onClick={() => {
            onRemoveView(item);
            handleClose();
          }}
        >
          <span className="text">{_l('删除%05000')}</span>
        </MenuItem>
      )}
    </Menu>
  );
}

export default SettingMenu;
