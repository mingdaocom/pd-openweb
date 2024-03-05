import React, { Fragment, useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Tooltip, Icon, Menu, MenuItem } from 'ming-ui';
import DialogImportExcelCreate from 'worksheet/components/DialogImportExcelCreate';
import CreateNew from 'worksheet/common/WorkSheetLeft/CreateNew';
import { addFirstAppSection, createAppItem, getSheetList } from 'worksheet/redux/actions/sheetList';
import { getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import { findSheet } from 'worksheet/util';
import cx from 'classnames';
import Trigger from 'rc-trigger';

const CREATE_ITEM_LIST = [
  { icon: 'plus', text: _l('从空白创建'), createType: 'worksheet' },
  { icon: 'new_excel', text: _l('从Excel创建'), createType: 'importExcel' },
  { icon: 'dashboard', text: _l('创建自定义页面'), createType: 'customPage' },
  { icon: 'add-files', text: _l('分组'), createType: 'group' },
];

function CreateAppItem(props) {
  const { isCharge, projectId, appId, groupId, worksheetId, children } = props;
  const { appSectionDetail } = props;
  const { addFirstAppSection } = props;
  const [createMenuVisible, setCreateMenuVisible] = useState(false);
  const [createType, setCreateType] = useState('');
  const [dialogImportExcel, setDialogImportExcel] = useState(false);
  const singleRef = getAppSectionRef(groupId);
  const appItem = findSheet(worksheetId, appSectionDetail);

  useEffect(() => {
    window.__worksheetLeftReLoad = () => {
      singleRef.dispatch(
        getSheetList({ appId, appSectionId: appItem ? appItem.parentGroupId || appItem.parentId : groupId }),
      );
    };
    return () => {
      delete window.__worksheetLeftReLoad;
    };
  }, []);

  const handleCreate = (type, args) => {
    if (singleRef) {
      singleRef.dispatch(
        createAppItem({
          appId,
          groupId: appItem ? appItem.parentGroupId || appItem.parentId : groupId,
          firstGroupId: appItem && appItem.parentGroupId ? groupId : undefined,
          type,
          ...args,
        }),
      );
    }
    setCreateType('');
  };

  const handleSwitchCreateType = type => {
    if (type === 'importExcel') {
      setCreateMenuVisible(false);
      setDialogImportExcel(true);
      return;
    }
    if (type === 'group') {
      addFirstAppSection();
      setCreateMenuVisible(false);
      return;
    }
    setCreateType(type);
    setCreateMenuVisible(false);
  };

  return (
    <Fragment>
      {isCharge && (
        <Trigger
          forceRender={true}
          popupVisible={createMenuVisible}
          onPopupVisibleChange={setCreateMenuVisible}
          action={['click']}
          popupAlign={{
            points: ['tl', 'bl'],
            offset: [-10, 0],
            overflow: {
              adjustX: true,
              adjustY: true,
            },
          }}
          popup={
            <div className="createNewMenu">
              <Menu>
                {CREATE_ITEM_LIST.map((item, index) => (
                  <Fragment key={index}>
                    {item.createType === 'customPage' && <div className="spaceLine mTop4 mBottom4"></div>}
                    {item.createType === 'worksheet' && (
                      <div class="Gray_9e pLeft12 pTop7 pBottom3">{_l('工作表')}</div>
                    )}
                    {item.subList ? (
                      <Trigger
                        getPopupContainer={() => document.querySelector('.createWorksheetApp .Item-content')}
                        action={['hover']}
                        popupAlign={{ points: ['tl', 'tr'], offset: [0, -5] }}
                        popup={
                          <Menu className="createNewMenu subMenu">
                            {item.subList.map(item => (
                              <MenuItem key={item.createType} onClick={() => handleSwitchCreateType(item.createType)}>
                                <Icon icon={item.icon} className="Font18 Gray_9e" />
                                <span className="mLeft20">{item.text}</span>
                              </MenuItem>
                            ))}
                          </Menu>
                        }
                      >
                        <MenuItem className="createWorksheetApp" key={item.createType}>
                          <Icon icon={item.icon} className="Font18" />
                          <span className="mLeft20">{item.text}</span>
                          <Icon icon="arrow-right-tip" className="Font15" />
                        </MenuItem>
                      </Trigger>
                    ) : (
                      <MenuItem
                        key={item.createType}
                        onClick={() => {
                          handleSwitchCreateType(item.createType);
                        }}
                      >
                        <Icon icon={item.icon} className="Font18" />
                        <span className="mLeft20">{item.text}</span>
                      </MenuItem>
                    )}
                  </Fragment>
                ))}
              </Menu>
            </div>
          }
        >
          {children}
        </Trigger>
      )}
      {!!createType && (
        <CreateNew type={createType} onCreate={handleCreate} onCancel={() => handleSwitchCreateType('')} />
      )}
      {dialogImportExcel && (
        <DialogImportExcelCreate
          projectId={projectId}
          appId={appId}
          groupId={appItem ? appItem.parentGroupId || appItem.parentId : groupId}
          onCancel={() => setDialogImportExcel(false)}
          createType="worksheet"
          refreshPage={() => {
            singleRef.dispatch(
              getSheetList({ appId, appSectionId: appItem ? appItem.parentGroupId || appItem.parentId : groupId }),
            );
          }}
        />
      )}
    </Fragment>
  );
}

export default connect(
  state => ({
    appSectionDetail: state.sheetList.appSectionDetail,
  }),
  dispatch =>
    bindActionCreators(
      {
        addFirstAppSection,
      },
      dispatch,
    ),
)(CreateAppItem);
