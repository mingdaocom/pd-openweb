import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuItem, Icon } from 'ming-ui';
import Trigger from 'rc-trigger';
import DeleteConfirm from 'ming-ui/components/DeleteReconfirm';
import { setSheetName, openWorkSheetTrash, openResetAutoNumber } from 'worksheet/common';
import { toEditWidgetPage } from 'src/pages/widgetConfig/util/index';
import copy from 'copy-to-clipboard';
import { navigateTo } from 'src/router/navigateTo';
import { importDataFromExcel } from '../WorksheetBody/ImportDataFromExcel';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import _ from 'lodash';
import { canEditData, isHaveCharge, canEditApp } from 'src/pages/worksheet/redux/actions/util';
import { saveSelectExtensionNavType } from 'src/pages/publicWorksheetConfig/utils';
import { getFeatureStatus, buriedUpgradeVersionDialog } from 'src/util';
import { VersionProductType } from 'src/util/enum';

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
  const { setSheetDescVisible, setEditNameVisible, updateWorksheetInfo, reloadWorksheet, deleteSheet } = props;
  const { name, projectId, worksheetId, allowAdd, entityName, btnName } = worksheetInfo;
  const [menuVisible, setMenuVisible] = useState();
  const featureType = getFeatureStatus(projectId, VersionProductType.PAY);
  const autoNumberControls = _.filter(controls, item => item.type === 33);
  const canDelete = isCharge && !isLock;
  const canSheetTrash = isOpenPermit(permitList.sheetTrash, sheetSwitchPermit);
  const canImportSwitch = isOpenPermit(permitList.importSwitch, sheetSwitchPermit) && allowAdd;
  const canEdit = canEditApp(permissionType) || canEditData(permissionType);
  if (!canEdit && !canImportSwitch && !canSheetTrash && !canDelete) {
    return null;
  }

  const clickSettingSheet = () => {
    const sheetConfigNavInfo = localStorage.getItem('sheetConfigNavInfo')
      ? JSON.parse(localStorage.getItem('sheetConfigNavInfo'))
      : {};
    const { settingNav = 'submitForm' } = sheetConfigNavInfo[worksheetId] || {};

    navigateTo(`/worksheet/formSet/edit/${worksheetId}${settingNav ? '/' + settingNav : ''}`);
  };

  return (
    <span className="moreOperate mLeft6 pointer" onClick={() => setMenuVisible(true)}>
      <Icon className="Gray_9d Font20" icon="more_horiz" />
      {menuVisible && (
        <Menu style={{ zIndex: 999 }} onClick={e => e.stopPropagation()} onClickAway={() => setMenuVisible(false)}>
          {canEdit && (
            // 运营者有 修改名称和图标和 编辑工作表说明
            <Fragment>
              {isCharge && !isLock && (
                <React.Fragment>
                  <MenuItem
                    icon={<Icon icon="settings" className="Font18" />}
                    onClick={() => {
                      toEditWidgetPage(
                        { sourceId: worksheetId, fromURL: `/app/${appId}/${groupId}/${worksheetId}/${viewId}` },
                        false,
                      );
                    }}
                  >
                    <span className="text">{_l('编辑表单%02036')}</span>
                  </MenuItem>
                  <Trigger
                    getPopupContainer={() => document.querySelector('.moreOperate .settingSheet .Item-content')}
                    action={['hover']}
                    popupAlign={{ points: ['tl', 'tr'], offset: [0, -41] }}
                    popup={
                      <Menu className="subMenu">
                        {[
                          { type: 'submitForm', text: _l('提交表单') },
                          { type: 'alias', text: _l('数据名称') },
                          { type: 'functionalSwitch', text: _l('功能开关%02027') },
                          { type: 'display', text: _l('业务规则%02028') },
                          { type: 'customBtn', text: _l('自定义动作%02026') },
                          { type: 'printTemplate', text: _l('打印模板%02025') },
                          { type: 'indexSetting', text: _l('检索加速') },
                        ].map(({ type, text }) => (
                          <Fragment>
                            {type === 'customBtn' && <hr className="splitLine" />}
                            <MenuItem
                              key={type}
                              onClick={() => {
                                saveSelectExtensionNavType(worksheetId, 'settingNav', type);
                                navigateTo(`/worksheet/formSet/edit/${worksheetId}/${type}`);
                              }}
                            >
                              <span className="text">{text}</span>
                            </MenuItem>
                          </Fragment>
                        ))}
                        <hr className="splitLine" />
                        {[
                          { type: 'publicform', text: _l('公开发布%02024') },
                          { type: 'pay', text: _l('支付') },
                        ]
                          .filter(v => (v.type === 'pay' && featureType) || v.type !== 'pay')
                          .map(({ type, text }) => (
                            <MenuItem
                              key={type}
                              onClick={() => {
                                if (type === 'pay' && featureType === '2') {
                                  buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
                                  return;
                                }
                                saveSelectExtensionNavType(worksheetId, 'extensionNav', type);
                                navigateTo(`/worksheet/form/edit/${worksheetId}/${type}`);
                              }}
                            >
                              <span className="text">{text}</span>
                            </MenuItem>
                          ))}
                      </Menu>
                    }
                  >
                    <MenuItem
                      className="settingSheet"
                      icon={<Icon icon="table" className="Font18 pLeft3" />}
                      onClick={clickSettingSheet}
                    >
                      <span className="text">{_l('设置工作表%02035')}</span>
                      <Icon className="Font15" icon="arrow-right-tip" />
                    </MenuItem>
                  </Trigger>
                  <hr className="splitLine" />
                </React.Fragment>
              )}
              <MenuItem
                icon={<Icon icon="edit" className="Font18" />}
                onClick={() => {
                  setMenuVisible(false);
                  setEditNameVisible(true);
                }}
              >
                <span className="text">{_l('修改名称和图标%02034')}</span>
              </MenuItem>
              <MenuItem
                icon={<Icon icon="info" className="Font18" />}
                onClick={() => {
                  setMenuVisible(false);
                  setSheetDescVisible(true);
                }}
              >
                <span className="text">{_l('编辑工作表说明%02033')}</span>
              </MenuItem>
              {/* //重置自动编号 =>开发者|管理员|运营者 设置记录名称=>开发者|管理员 */}
              <Fragment>
                {isCharge && !isLock && (
                  <MenuItem
                    icon={<Icon icon="button-edit" />}
                    onClick={() => {
                      setMenuVisible(false);
                      setSheetName({
                        projectId: projectId,
                        worksheetId: worksheetId,
                        entityName: entityName,
                        btnName: btnName,
                        updateSheetInfo: (id, data) => {
                          updateWorksheetInfo(data);
                        },
                      });
                    }}
                  >
                    <span className="text">{_l('设置记录名称%02032')}</span>
                  </MenuItem>
                )}
                <MenuItem
                  icon={<Icon icon="ID" className="Font18" />}
                  onClick={() => {
                    copy(worksheetId);
                    alert(_l('复制成功'), 1);
                    setMenuVisible(false);
                  }}
                >
                  <span className="text">{_l('复制ID')}</span>
                </MenuItem>
                {!_.isEmpty(autoNumberControls) && (
                  <MenuItem
                    icon={<Icon icon="auto_number" />}
                    onClick={() => {
                      setMenuVisible(false);
                      openResetAutoNumber({
                        worksheetInfo,
                      });
                    }}
                  >
                    <span className="text">{_l('重置自动编号')}</span>
                  </MenuItem>
                )}
              </Fragment>
              <hr className="splitLine" />
            </Fragment>
          )}
          {/* 导入数据权限 */}
          {canImportSwitch && (
            <MenuItem
              icon={<Icon icon="restart" className="Font16" />}
              onClick={() => {
                if (window.isPublicApp) {
                  alert(_l('预览模式下，不能操作'), 3);
                  return;
                }
                importDataFromExcel({
                  isCharge: canEditData(permissionType) || canEditApp(permissionType),
                  appId,
                  worksheetId: worksheetId,
                  worksheetName: name,
                });
                setMenuVisible(false);
              }}
            >
              <span className="text">{_l('从Excel导入数据%02031')}</span>
            </MenuItem>
          )}
          {canEdit && (
            <MenuItem
              icon={<Icon icon="wysiwyg" className="Font16" />}
              onClick={() => {
                window.open(`/app/${appId}/logs/${projectId}/${worksheetId}`, '__blank');
              }}
            >
              <span className="text">{_l('日志')}</span>
            </MenuItem>
          )}
          {canSheetTrash && (
            <MenuItem
              icon={<Icon icon="recycle" />}
              onClick={() => {
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
                setMenuVisible(false);
              }}
            >
              <span className="text">{_l('回收站%02030')}</span>
            </MenuItem>
          )}
          {canDelete && (
            <MenuItem
              icon={<Icon icon="delete2" />}
              className="delete"
              onClick={() => {
                setMenuVisible(false);
                DeleteConfirm({
                  clickOmitText: true,
                  title: (
                    <div className="Bold">
                      <i className="icon-error error" style={{ fontSize: '28px', marginRight: '8px' }}></i>
                      {_l('删除工作表 “%0”', name)}
                    </div>
                  ),
                  description: (
                    <div>
                      <span style={{ color: '#151515', fontWeight: 'bold' }}>
                        {_l('注意：工作表下所有配置和数据将被删除。')}
                      </span>
                      {_l('请务必确认所有应用成员都不再需要此工作表后，再执行此操作。')}
                    </div>
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
              }}
            >
              <span className="text">{_l('删除工作表%02029')}</span>
            </MenuItem>
          )}
        </Menu>
      )}
    </span>
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
