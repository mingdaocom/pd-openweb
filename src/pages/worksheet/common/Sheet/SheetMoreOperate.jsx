import React, { useState } from 'react';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { DeleteReconfirm as DeleteConfirm, Dropdown } from 'ming-ui/antd-components';
import { useResetAutoNumber } from 'worksheet/common/ResetAutoNumber';
import { useImportAttachmentsDialog } from 'worksheet/common/WorksheetBody/ImportAttachments';
import { useImportDataFromExcel } from 'worksheet/common/WorksheetBody/ImportDataFromExcel';
import { useWorkSheetTrash } from 'worksheet/common/WorkSheetTrash';
import { toEditWidgetPage } from 'src/pages/widgetConfig/navigation';
import WorksheetReference, {
  useWorksheetReferenceDialog,
} from 'src/pages/widgetConfig/widgetSetting/components/WorksheetReference';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { permitList } from 'src/utils/domain/control/formEnum';
import { canEditApp, canEditData, isHaveCharge } from 'src/utils/domain/permission/app';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';
import { getHighAuthSheetSwitchPermit } from 'src/utils/domain/worksheet/helpers';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { saveSelectExtensionNavType } from 'src/utils/platform/storage/worksheet';
import { getFeatureStatus } from 'src/utils/services/project';
import { getImportMenuItems } from './ImportMenu';

const settingMenuList = [
  { type: 'submitForm', text: _l('提交表单'), navType: 'settingNav', subPath: 'formSet' },
  { type: 'alias', text: _l('数据名称'), navType: 'settingNav', subPath: 'formSet' },
  { type: 'functionalSwitch', text: _l('功能开关%02027'), navType: 'settingNav', subPath: 'formSet' },
  { type: 'share', text: _l('公开分享'), navType: 'settingNav', subPath: 'formSet' },
  { type: 'splitLine' },
  { type: 'display', text: _l('业务规则%02028'), navType: 'settingNav', subPath: 'formSet' },
  { type: 'customAction', text: _l('自定义动作%02026'), navType: 'settingNav', subPath: 'formSet' },
  { type: 'aiAction', text: _l('AI 动作'), navType: 'settingNav', subPath: 'formSet' },
  { type: 'printTemplate', text: _l('打印模板%02025'), navType: 'settingNav', subPath: 'formSet' },
  { type: 'editProtect', text: _l('编辑保护'), navType: 'settingNav', subPath: 'formSet' },
  { type: 'indexSetting', text: _l('检索加速'), navType: 'settingNav', subPath: 'formSet' },
  { type: 'splitLine' },
  { type: 'publicform', text: _l('公开表单'), navType: 'extensionNav', subPath: 'form' },
  { type: 'query', text: _l('公开查询'), navType: 'extensionNav', subPath: 'form' },
  { type: 'splitLine', featureIds: [VersionProductType.PAY, VersionProductType.invoice] },
  { type: 'pay', text: _l('支付'), navType: 'extensionNav', subPath: 'form', featureId: VersionProductType.PAY },
  {
    type: 'invoice',
    text: _l('开票'),
    navType: 'extensionNav',
    subPath: 'form',
    featureId: VersionProductType.invoice,
  },
];

export default function SheetMoreOperate(props) {
  const {
    appId,
    groupId,
    viewId,
    isCharge,
    worksheetInfo,
    sheet,
    controls,
    sheetSwitchPermit,
    isLock,
    permissionType,
  } = props;
  const { setSheetDescVisible, selectIcon, reloadWorksheet, deleteSheet } = props;
  const { name, projectId, worksheetId, allowAdd } = worksheetInfo;
  const [menuVisible, setMenuVisible] = useState(false);
  const { open: openResetAutoNumber, holder: resetAutoNumberHolder } = useResetAutoNumber();
  const { open: openWorkSheetTrash, holder: workSheetTrashHolder } = useWorkSheetTrash();
  const { open: importDataFromExcel, holder: importDataFromExcelHolder } = useImportDataFromExcel();
  const { open: importAttachmentsDialog, holder: importAttachmentsDialogHolder } = useImportAttachmentsDialog();
  const { open: openWorksheetReferenceDialog, holder: worksheetReferenceDialogHolder } = useWorksheetReferenceDialog();
  const autoNumberControls = _.filter(controls, item => item.type === 33);
  const canDelete = isCharge && !isLock;
  const lastSheetSwitchPermit =
    viewId === worksheetId && isCharge
      ? getHighAuthSheetSwitchPermit(sheetSwitchPermit, worksheetId)
      : sheetSwitchPermit;
  const canSheetTrash = isOpenPermit(permitList.sheetTrash, lastSheetSwitchPermit);
  const canEdit = canEditApp(permissionType) || canEditData(permissionType);
  const canImportSwitch = isOpenPermit(permitList.importSwitch, lastSheetSwitchPermit) && !window.isPublicApp;

  if (!canEdit && !canImportSwitch && !canSheetTrash && !canDelete) {
    return null;
  }

  const clickSettingSheet = () => {
    const sheetConfigNavInfoStr = localStorage.getItem('sheetConfigNavInfo');
    const sheetConfigNavInfo = sheetConfigNavInfoStr ? safeParse(sheetConfigNavInfoStr, 'object') || {} : {};
    const { settingNav = 'submitForm' } = sheetConfigNavInfo[worksheetId] || {};

    navigateTo(`/worksheet/formSet/edit/${worksheetId}${settingNav ? '/' + settingNav : ''}`);
  };

  const closeMenu = () => setMenuVisible(false);
  const renderMenuLabel = text => <span className="text">{text}</span>;
  const renderMenuIcon = (icon, danger) => <Icon icon={icon} className={danger ? 'Font18' : 'Font18 textTertiary'} />;

  const settingMenuItems = settingMenuList
    .map(({ type, text, navType, subPath, featureId, featureIds }, index) => {
      if (
        (md.global.SysSettings.hideAIBasicFun && type === 'aiAction') ||
        (featureId && !getFeatureStatus(projectId, featureId)) ||
        (featureIds && featureIds.every(id => !getFeatureStatus(projectId, id)))
      ) {
        return null;
      }

      return type === 'splitLine'
        ? {
            key: `settingSplitLine-${index}`,
            type: 'divider',
            className: 'mTop5 mBottom5',
          }
        : {
            key: type,
            style: { minWidth: 180 },
            label: renderMenuLabel(text),
            onClick: () => {
              closeMenu();
              saveSelectExtensionNavType(worksheetId, navType, type);
              navigateTo(`/worksheet/${subPath}/edit/${worksheetId}/${type}`);
            },
          };
    })
    .filter(Boolean);

  const importMenuItems = getImportMenuItems({
    isCharge: canEdit,
    allowAdd,
    controls,
    projectId,
    appId,
    worksheetId,
    worksheetName: name,
    viewId,
    onMenuClick: closeMenu,
    renderMenuLabel,
    itemStyle: { width: 180 },
    importDataFromExcel,
    importAttachmentsDialog,
  });

  const menuItems = [
    isCharge &&
      !isLock && {
        key: 'editSheet',
        icon: renderMenuIcon('settings'),
        label: renderMenuLabel(_l('编辑表单%02036')),
        onClick: () => {
          closeMenu();
          toEditWidgetPage(
            { sourceId: worksheetId, fromURL: `/app/${appId}/${groupId}/${worksheetId}/${viewId}` },
            false,
          );
        },
      },
    isCharge &&
      !isLock && {
        key: 'setSheet',
        className: 'settingSheet',
        popupOffset: [0, -41],
        icon: renderMenuIcon('table'),
        label: renderMenuLabel(_l('设置工作表%02035')),
        children: settingMenuItems,
        onTitleClick: () => {
          closeMenu();
          clickSettingSheet();
        },
      },
    canEdit && {
      key: 'editNameIcon',
      icon: renderMenuIcon('edit'),
      label: renderMenuLabel(_l('修改名称和图标%02034')),
      onClick: () => {
        closeMenu();
        selectIcon();
      },
    },
    canEdit && {
      key: 'editIntro',
      icon: renderMenuIcon('info'),
      label: renderMenuLabel(_l('工作表说明')),
      onClick: () => {
        closeMenu();
        setSheetDescVisible(true);
      },
    },
    canEdit &&
      !_.isEmpty(autoNumberControls) && {
        key: 'resetNumber',
        icon: renderMenuIcon('auto_number'),
        label: renderMenuLabel(_l('重置自动编号')),
        onClick: () => {
          closeMenu();
          openResetAutoNumber({ worksheetInfo });
        },
      },
    canEdit && {
      key: 'editDivider',
      type: 'divider',
      className: 'mTop5 mBottom5',
    },
    canEdit &&
      canEditApp(permissionType, isLock) && {
        key: 'workflow',
        icon: renderMenuIcon('workflow'),
        label: renderMenuLabel(_l('查看工作流')),
        onClick: () => {
          closeMenu();
          window.open(pathCompletion(`/app/${appId}/workflow` + `/${worksheetId}`), '__blank');
        },
      },
    canEdit &&
      canEditApp(permissionType, isLock) && {
        key: 'reference',
        icon: renderMenuIcon('db_index'),
        label: renderMenuLabel(_l('查看引用关系')),
        onClick: () => {
          closeMenu();
          openWorksheetReferenceDialog({ globalSheetInfo: { appId, worksheetId, name, controls }, type: 2 });
        },
      },
    canEdit &&
      canEditData(permissionType) && {
        key: 'logs',
        icon: renderMenuIcon('wysiwyg'),
        label: renderMenuLabel(_l('查看日志')),
        onClick: () => {
          closeMenu();
          window.open(pathCompletion(`/app/${appId}/logs/${projectId}/${worksheetId}`), '__blank');
        },
      },
    canEdit && {
      key: 'copyID',
      icon: renderMenuIcon('ID'),
      label: renderMenuLabel(_l('复制 ID')),
      onClick: () => {
        closeMenu();
        copy(worksheetId);
        alert(_l('复制成功'));
      },
    },
    canEdit && {
      key: 'importDivider',
      type: 'divider',
      className: 'mTop5 mBottom5',
    },
    canImportSwitch && {
      key: 'import',
      className: 'importMenu',
      popupOffset: [0, 0],
      icon: renderMenuIcon('worksheet_import'),
      label: renderMenuLabel(_l('导入')),
      children: importMenuItems,
    },
    canSheetTrash && {
      key: 'recycle',
      icon: renderMenuIcon('recycle'),
      label: renderMenuLabel(_l('回收站%02030')),
      onClick: () => {
        openWorkSheetTrash({
          appId,
          worksheetInfo,
          projectId,
          isCharge: isHaveCharge(permissionType),
          isAdmin: isCharge,
          controls,
          worksheetId: worksheetId,
          reloadWorksheet,
        });
        closeMenu();
      },
    },
    canDelete && {
      key: 'delete',
      danger: true,
      className: 'delete',
      icon: renderMenuIcon('trash', true),
      label: renderMenuLabel(_l('删除工作表%02029')),
      onClick: () => {
        closeMenu();
        DeleteConfirm({
          title: _l('删除工作表 “%0”', name),
          description: (
            <div>
              <span style={{ color: 'var(--color-text-title)', fontWeight: 'bold' }}>
                {_l('注意：工作表下所有配置和数据将被删除。')}
              </span>
              {_l('请务必确认所有应用成员都不再需要此工作表后，再执行此操作。')}
            </div>
          ),
          expandBtn: (
            <WorksheetReference
              type={2}
              globalSheetInfo={{
                appId,
                worksheetId,
                name,
                controls,
              }}
            />
          ),
          data: [{ text: _l('我确认删除工作表和所有数据'), value: 1 }],
          onOk: () => {
            deleteSheet({
              type: sheet.type,
              appId,
              groupId,
              projectId,
              worksheetId,
              parentGroupId: sheet.parentGroupId,
            });
          },
        });
      },
    },
  ].filter(Boolean);

  return (
    <React.Fragment>
      {resetAutoNumberHolder}
      {workSheetTrashHolder}
      {importDataFromExcelHolder}
      {importAttachmentsDialogHolder}
      {worksheetReferenceDialogHolder}
      <Dropdown
        trigger={['click']}
        open={menuVisible}
        onOpenChange={setMenuVisible}
        placement="bottomLeft"
        menu={{
          items: menuItems,
          selectable: false,
          selectedKeys: [],
          style: { minWidth: 220 },
          onClick: ({ domEvent }) => domEvent.stopPropagation(),
        }}
      >
        <span className="moreOperate mLeft6 pointer">
          <Icon className="textTertiary Font20" icon="more_horiz" />
        </span>
      </Dropdown>
    </React.Fragment>
  );
}

SheetMoreOperate.propTypes = {
  appId: PropTypes.string,
  controls: PropTypes.arrayOf(PropTypes.shape({})),
  groupId: PropTypes.string,
  isCharge: PropTypes.bool,
  sheetSwitchPermit: PropTypes.arrayOf(PropTypes.shape({})),
  updateWorksheetInfo: PropTypes.func,
  viewId: PropTypes.string,
  worksheetInfo: PropTypes.shape({}),
  reloadWorksheet: PropTypes.func,
  setSheetDescVisible: PropTypes.func,
  isLock: PropTypes.bool,
};
