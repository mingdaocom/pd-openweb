import React, { Fragment, useState } from 'react';
import copy from 'copy-to-clipboard';
import _ from 'lodash';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import { Icon, Menu, MenuItem } from 'ming-ui';
import DeleteConfirm from 'ming-ui/components/DeleteReconfirm';
import { openResetAutoNumber, openWorkSheetTrash } from 'worksheet/common';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { toEditWidgetPage } from 'src/pages/widgetConfig/util/index';
import WorksheetReference, { renderDialog } from 'src/pages/widgetConfig/widgetSetting/components/WorksheetReference';
import { canEditApp, canEditData, isHaveCharge } from 'src/pages/worksheet/redux/actions/util';
import { navigateTo } from 'src/router/navigateTo';
import { saveSelectExtensionNavType } from 'src/utils/worksheet';
import { getHighAuthSheetSwitchPermit } from 'src/utils/worksheet';
import { importDataFromExcel } from '../WorksheetBody/ImportDataFromExcel';

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
  const { setSheetDescVisible, setEditNameVisible, reloadWorksheet, deleteSheet } = props;
  const { name, projectId, worksheetId, allowAdd } = worksheetInfo;
  const [menuVisible, setMenuVisible] = useState();
  const autoNumberControls = _.filter(controls, item => item.type === 33);
  const canDelete = isCharge && !isLock;
  const lastSheetSwitchPermit =
    viewId === worksheetId && isCharge
      ? getHighAuthSheetSwitchPermit(sheetSwitchPermit, worksheetId)
      : sheetSwitchPermit;
  const canSheetTrash = isOpenPermit(permitList.sheetTrash, lastSheetSwitchPermit);
  const canImportSwitch = isOpenPermit(permitList.importSwitch, lastSheetSwitchPermit) && allowAdd;
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
        <Menu
          className="sheetHeaderOperate"
          style={{ zIndex: 999 }}
          onClick={e => e.stopPropagation()}
          onClickAway={() => setMenuVisible(false)}
        >
          {isCharge && !isLock && (
            <React.Fragment>
              <MenuItem
                data-event="editSheet"
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
                  <Menu className="subMenu sheetHeaderOperate_subMenu">
                    {[
                      { type: 'submitForm', text: _l('提交表单') },
                      { type: 'alias', text: _l('数据名称') },
                      { type: 'functionalSwitch', text: _l('功能开关%02027') },
                      { type: 'share', text: _l('公开分享') },
                      { type: 'display', text: _l('业务规则%02028') },
                      { type: 'customBtn', text: _l('自定义动作%02026') },
                      { type: 'printTemplate', text: _l('打印模板%02025') },
                      { type: 'editProtect', text: _l('编辑保护') },
                      { type: 'indexSetting', text: _l('检索加速') },
                    ].map(({ type, text }) => (
                      <Fragment>
                        {type === 'display' && <hr className="splitLine" />}
                        <MenuItem
                          data-event={type}
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
                    ].map(({ type, text }) => (
                      <MenuItem
                        data-event={type}
                        key={type}
                        onClick={() => {
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
                  data-event="setSheet"
                  className="settingSheet"
                  icon={<Icon icon="table" className="Font18" />}
                  onClick={clickSettingSheet}
                >
                  <span className="text">{_l('设置工作表%02035')}</span>
                  <Icon className="Font15" icon="arrow-right-tip" />
                </MenuItem>
              </Trigger>
            </React.Fragment>
          )}

          {canEdit && (
            <Fragment>
              <MenuItem
                data-event="editNameIcon"
                icon={<Icon icon="edit" className="Font18" />}
                onClick={() => {
                  setMenuVisible(false);
                  setEditNameVisible(true);
                }}
              >
                <span className="text">{_l('修改名称和图标%02034')}</span>
              </MenuItem>
              <MenuItem
                data-event="editIntro"
                icon={<Icon icon="info" className="Font18" />}
                onClick={() => {
                  setMenuVisible(false);
                  setSheetDescVisible(true);
                }}
              >
                <span className="text">{_l('工作表说明')}</span>
              </MenuItem>
            </Fragment>
          )}

          {canEdit && (
            <Fragment>
              {!_.isEmpty(autoNumberControls) && (
                <MenuItem
                  data-event="resetNumber"
                  icon={<Icon icon="auto_number" className="Font18" />}
                  onClick={() => {
                    setMenuVisible(false);
                    openResetAutoNumber({ worksheetInfo });
                  }}
                >
                  <span className="text">{_l('重置自动编号')}</span>
                </MenuItem>
              )}

              <hr className="splitLine" />
              {canEditApp(permissionType, isLock) && (
                <>
                  <MenuItem
                    data-event="workflow"
                    icon={<Icon icon="workflow" className="Font18" />}
                    onClick={() => {
                      setMenuVisible(false);
                      window.open(`/app/${appId}/workflow` + `/${worksheetId}`, '__blank');
                    }}
                  >
                    <span className="text">{_l('查看工作流')}</span>
                  </MenuItem>

                  <MenuItem
                    data-event="reference"
                    icon={<Icon icon="db_index" className="Font18" />}
                    onClick={() => {
                      setMenuVisible(false);
                      renderDialog({ globalSheetInfo: { appId, worksheetId, name, controls }, type: 2 });
                    }}
                  >
                    <span className="text">{_l('查看引用关系')}</span>
                  </MenuItem>
                </>
              )}

              {canEditData(permissionType) && (
                <MenuItem
                  data-event="logs"
                  icon={<Icon icon="wysiwyg" className="Font18" />}
                  onClick={() => {
                    setMenuVisible(false);
                    window.open(`/app/${appId}/logs/${projectId}/${worksheetId}`, '__blank');
                  }}
                >
                  <span className="text">{_l('查看日志')}</span>
                </MenuItem>
              )}

              <MenuItem
                data-event="copyID"
                icon={<Icon icon="ID" className="Font18" />}
                onClick={() => {
                  setMenuVisible(false);
                  copy(worksheetId);
                  alert(_l('复制成功'));
                }}
              >
                <span className="text">{_l('复制ID')}</span>
              </MenuItem>

              <hr className="splitLine" />
            </Fragment>
          )}

          {/* 导入数据权限 */}
          {canImportSwitch && (
            <MenuItem
              data-event="importExcel"
              icon={<Icon icon="reply1" className="Font18" />}
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
          {canSheetTrash && (
            <MenuItem
              data-event="recycle"
              icon={<Icon icon="recycle" className="Font18" />}
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
              data-event="delete"
              icon={<Icon icon="trash" className="Font18" />}
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
                  expandBtn: (
                    <span className="Left">
                      <WorksheetReference
                        type={2}
                        globalSheetInfo={{
                          appId,
                          worksheetId,
                          name,
                          controls,
                        }}
                      />
                    </span>
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
