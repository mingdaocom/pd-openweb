import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Menu, MenuItem, Icon } from 'ming-ui';
import Trigger from 'rc-trigger';
import DeleteConfirm from 'ming-ui/components/DeleteReconfirm';
import { setSheetName, openWorkSheetTrash, openResetAutoNumber } from 'worksheet/common';
import { toEditWidgetPage } from 'src/pages/widgetConfig/util/index';
import { navigateTo } from 'src/router/navigateTo';
import { importDataFromExcel } from '../WorksheetBody/ImportDataFromExcel';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';

export default function SheetMoreOperate(props) {
  const { appId, groupId, viewId, isCharge, worksheetInfo, controls, sheetSwitchPermit } = props;
  const { setSheetDescVisible, setEditNameVisible, updateWorksheetInfo, reloadWorksheet, deleteSheet } = props;
  const { name, projectId, worksheetId, allowAdd, entityName, btnName } = worksheetInfo;
  const [menuVisible, setMenuVisible] = useState();
  const autoNumberControls = _.filter(controls, item => item.type === 33);

  return (
    <span className="moreOperate mLeft6 pointer" onClick={() => setMenuVisible(true)}>
      <Icon className="Gray_9d Font20" icon="more_horiz" />
      {menuVisible && (
        <Menu onClick={e => e.stopPropagation()} onClickAway={() => setMenuVisible(false)}>
          {isCharge && (
            <Fragment>
              <MenuItem
                icon={<Icon icon="settings" className="Font18" />}
                onClick={() => {
                  toEditWidgetPage(
                    { sourceId: worksheetId, fromURL: `/app/${appId}/${groupId}/${worksheetId}/${viewId}` },
                    false,
                  );
                }}
              >
                <span className="text">{_l('编辑表单')}</span>
              </MenuItem>
              <Trigger
                getPopupContainer={() => document.querySelector('.moreOperate .settingSheet .Item-content')}
                action={['hover']}
                popupAlign={{ points: ['tl', 'tr'], offset: [0, -20] }}
                popup={
                  <Menu className="subMenu">
                    <MenuItem
                      onClick={() => {
                        navigateTo(`/worksheet/formSet/edit/${worksheetId}/display`);
                      }}
                    >
                      <span className="text">{_l('业务规则')}</span>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        navigateTo(`/worksheet/formSet/edit/${worksheetId}/functionalSwitch`);
                      }}
                    >
                      <span className="text">{_l('功能开关')}</span>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        navigateTo(`/worksheet/formSet/edit/${worksheetId}/customBtn`);
                      }}
                    >
                      <span className="text">{_l('自定义动作')}</span>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        navigateTo(`/worksheet/formSet/edit/${worksheetId}/printTemplate`);
                      }}
                    >
                      <span className="text">{_l('打印模板')}</span>
                    </MenuItem>
                    <hr className="splitLine" />
                    <MenuItem
                      onClick={() => {
                        navigateTo(`/worksheet/form/edit/${worksheetId}`);
                      }}
                    >
                      <span className="text">{_l('公开发布')}</span>
                    </MenuItem>
                  </Menu>
                }
              >
                <MenuItem className="settingSheet" icon={<Icon icon="table" className="Font18 pLeft3" />}>
                  <span className="text">{_l('设置工作表')}</span>
                  <Icon className="Font15" icon="arrow-right-tip" />
                </MenuItem>
              </Trigger>
              <hr className="splitLine" />
              <MenuItem
                icon={<Icon icon="edit" className="Font18" />}
                onClick={() => {
                  setMenuVisible(false);
                  setEditNameVisible(true);
                }}
              >
                <span className="text">{_l('修改名称和图标')}</span>
              </MenuItem>
              <MenuItem
                icon={<Icon icon="info" className="Font18" />}
                onClick={() => {
                  setMenuVisible(false);
                  setSheetDescVisible(true);
                }}
              >
                <span className="text">{_l('编辑工作表说明')}</span>
              </MenuItem>
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
                <span className="text">{_l('设置记录名称')}</span>
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
              <hr className="splitLine" />
            </Fragment>
          )}
          {/* 导入数据权限 */}
          {isOpenPermit(permitList.importSwitch, sheetSwitchPermit) && allowAdd && (
            <MenuItem
              icon={<Icon icon="restart" className="Font16" />}
              onClick={() => {
                if (window.isPublicApp) {
                  alert(_l('预览模式下，不能操作'), 3);
                  return;
                }
                importDataFromExcel({
                  isCharge,
                  appId,
                  worksheetId: worksheetId,
                  worksheetName: name,
                });
                setMenuVisible(false);
              }}
            >
              <span className="text">{_l('从 Excel 导入数据')}</span>
            </MenuItem>
          )}
          <MenuItem
            icon={<Icon icon="recycle" />}
            onClick={() => {
              openWorkSheetTrash({
                appId,
                worksheetInfo,
                isCharge,
                isAdmin: isCharge,
                controls,
                worksheetId: worksheetId,
                reloadWorksheet,
              });
              setMenuVisible(false);
            }}
          >
            <span className="text">{_l('回收站')}</span>
          </MenuItem>
          {isCharge && (
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
                      <span style={{ color: '#333', fontWeight: 'bold' }}>
                        {_l('注意：工作表下所有配置和数据将被永久删除，不可恢复。')}
                      </span>
                      {_l('请务必确认所有应用成员都不再需要此工作表后，再执行此操作。')}
                    </div>
                  ),
                  data: [{ text: _l('我确认永久删除工作表和所有数据'), value: 1 }],
                  onOk: () => {
                    deleteSheet({
                      appId,
                      groupId,
                      projectId,
                      worksheetId,
                    });
                  },
                });
              }}
            >
              <span className="text">{_l('删除工作表')}</span>
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
};
