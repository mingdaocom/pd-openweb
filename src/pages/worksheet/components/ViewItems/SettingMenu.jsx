import React from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { getDefaultViewSet } from 'src/pages/worksheet/constants/common';
import { permitList } from 'src/utils/domain/control/formEnum';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/utils/domain/worksheet/constants';
import { getFeatureStatus } from 'src/utils/services/project';

const HIDDEN_MENU = [
  {
    text: _l('全隐藏%05011'),
    textShow: _l('全显示%05008'),
    key: ['hide', 'show'],
  },
  {
    text: _l('仅在PC端隐藏%05010'),
    textShow: _l('仅在PC端显示%05007'),
    key: ['hpc&sapp', 'spc&happ'],
  },
  {
    text: _l('仅在移动端隐藏%05009'),
    textShow: _l('仅在移动端显示%05006'),
    key: ['spc&happ', 'hpc&sapp'],
  },
];

function getSettingMenuItems(props) {
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
      handleClose();
    } else {
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

    handleClose();
  };

  const handleCopyConfig = type => {
    onCopyConfig(item, type);
    handleClose();
  };

  const getViewDisplayMenuItems = () =>
    VIEW_TYPE_ICON.filter(o => o.id !== 'customize' && (md.global.SysSettings.enableMap || o.id !== 'map')).map(
      ({ icon, text, id, color, isNew }) => ({
        key: id,
        onClick: () => handleChangeViewType(id),
        icon: <Icon style={{ color }} className="Font18" icon={icon} />,
        label: text,
        className: VIEW_DISPLAY_TYPE[item.viewType] === id && 'bgColorPrimaryTransparent',
        extra: (
          <div className="flexRow alignItemsCenter">
            {VIEW_DISPLAY_TYPE[item.viewType] === id && <Icon icon="done" className="colorPrimary Font20" />}
            {isNew && (
              <div className="newIcon">
                <Icon icon="new" className="colorPrimary Font20" />
              </div>
            )}
          </div>
        ),
      }),
    );

  const getHiddenMenuItems = () => {
    const showhide = _.get(item, 'advancedSetting.showhide') || 'show';
    const type = showhide === 'hide' ? 1 : 0;

    return HIDDEN_MENU.map((hiddenItem, index) => {
      const hiddenValue = hiddenItem.key[type];
      const isCurrent = showhide === hiddenValue;

      return {
        key: `hiddenMenu${index}`,
        onClick: () => onChangeHidden(isCurrent ? '' : hiddenValue),
        label: hiddenItem[showhide !== 'hide' ? 'text' : 'textShow'],
        className: isCurrent && 'bgColorPrimaryTransparent',
        extra: isCurrent && <Icon icon="done" className="colorPrimary Font20" />,
      };
    });
  };

  const getExportMenuItems = () =>
    [
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
    ]
      .filter(it => it.exportType !== 2 || !_.isEmpty(getAttachmentControls()))
      .map(it => ({
        key: it.key,
        icon: <Icon icon={it.icon} className="textTertiary Font18" />,
        label: it.name,
        onClick: () => handleExport(it),
      }));

  const getMenuItems = () => {
    const items = [];

    if (editName && isCharge) {
      items.push({
        key: 'rename',
        icon: <Icon icon="workflow_write" className="Font18 textTertiary" />,
        onClick: clickEditName,
        label: <span className="text">{_l('重命名%05004')}</span>,
      });
    }

    if (!isDelCustomize()) {
      if (!isLock && isCharge) {
        items.push(
          {
            key: 'config',
            icon: <Icon icon="settings" className="Font18 textTertiary" />,
            onClick: () => {
              onOpenView(item);
              handleClose();
            },
            label: <span className="text">{_l('配置视图%05024')}</span>,
          },
          {
            key: 'copyConfigFrom',
            onClick: () => handleCopyConfig(1),
            style: { paddingLeft: 36 },
            label: <span className="text">{_l('从其他视图复制')}</span>,
          },
          {
            key: 'copyConfigTo',
            onClick: () => handleCopyConfig(2),
            style: { paddingLeft: 36 },
            label: <span className="text">{_l('应用到其他视图')}</span>,
          },
        );
      }

      if (isCharge) {
        items.push({
          key: 'splitLine',
          type: 'divider',
          className: 'splitLine',
        });
      }

      if (changeViewType && !isLock && isCharge && !['customize'].includes(VIEW_DISPLAY_TYPE[item.viewType])) {
        items.push({
          key: 'changeType',
          popupStyle: { minWidth: 200 },
          icon: <Icon icon="swap_horiz" className="Font18 textTertiary" />,
          label: <span className="text">{_l('更改视图类型%05023')}</span>,
          children: getViewDisplayMenuItems(),
        });
      }

      if (!isLock && isCharge && !['customize'].includes(VIEW_DISPLAY_TYPE[item.viewType])) {
        items.push({
          key: 'copy',
          icon: <Icon icon="content-copy" className="Font18 textTertiary" />,
          onClick: () => {
            onCopyView(item);
            handleClose();
            onCopy && onCopy();
          },
          label: <span className="text">{_l('复制%05003')}</span>,
        });
      }

      if (canShare()) {
        items.push({
          key: 'share',
          icon: <Icon icon="share" className="Font18 textTertiary" />,
          onClick: () => {
            if (window.isPublicApp) {
              alert(_l('预览模式下，不能操作'), 3);
              return;
            }

            onShare(item);
            handleClose();
          },
          label: <span className="text">{_l('分享%05021')}</span>,
        });
      }

      if (canExport()) {
        items.push({
          key: 'export',
          popupStyle: { minWidth: 200 },
          icon: <Icon icon="worksheet_export" className="Font18 textTertiary" />,
          label: <span className="text">{_l('导出%05020')}</span>,
          children: getExportMenuItems(),
        });
      }
    }

    if (isCharge) {
      items.push(
        {
          key: 'hide',
          popupStyle: { minWidth: 200 },
          icon: (
            <Icon
              icon={_.get(item, 'advancedSetting.showhide') !== 'hide' ? 'visibility_off' : 'visibility'}
              className="Font18 textTertiary"
            />
          ),
          label: (
            <span className="text">
              {_.get(item, 'advancedSetting.showhide') !== 'hide' ? _l('从导航栏中隐藏%05001') : _l('取消隐藏%05002')}
            </span>
          ),
          children: getHiddenMenuItems(),
        },
        {
          key: 'delete',
          icon: <Icon icon="hr_delete" className="Font18" />,
          danger: true,
          onClick: () => {
            onRemoveView(item);
            handleClose();
          },
          label: <span className="text">{_l('删除%05000')}</span>,
        },
      );
    }

    return items;
  };

  return getMenuItems();
}

export default getSettingMenuItems;
