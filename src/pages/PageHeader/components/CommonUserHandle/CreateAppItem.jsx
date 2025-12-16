import React, { Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Icon, Menu, MenuItem } from 'ming-ui';
import chatbotIcon from 'worksheet/common/WorkSheetLeft/assets/chatbot.png';
import customPageIcon from 'worksheet/common/WorkSheetLeft/assets/dashboard.png';
import worksheetIcon from 'worksheet/common/WorkSheetLeft/assets/worksheet.png';
import CreateNew from 'worksheet/common/WorkSheetLeft/CreateNew';
import DialogImportExcelCreate from 'worksheet/components/DialogImportExcelCreate';
import { addFirstAppSection, createAppItem, getSheetList } from 'worksheet/redux/actions/sheetList';
import { getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import { CREATE_ITEM_LIST } from 'src/pages/worksheet/common/WorkSheetLeft/enum';
import { findSheet } from 'src/utils/worksheet';

function CreateAppItem(props) {
  const { isCharge, projectId, appId, groupId, worksheetId, children, appPkg } = props;
  const { appSectionDetail } = props;
  const { addFirstAppSection } = props;
  const { workflowAgentFeatureType } = appPkg;
  const [createMenuVisible, setCreateMenuVisible] = useState(false);
  const [createType, setCreateType] = useState('');
  const [dialogImportExcel, setDialogImportExcel] = useState(false);
  const singleRef = getAppSectionRef(groupId);
  const appItem = findSheet(worksheetId, appSectionDetail);
  const iconMaps = {
    worksheet: worksheetIcon,
    customPage: customPageIcon,
    chatbot: chatbotIcon,
  };

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
                {CREATE_ITEM_LIST.filter(item => {
                  if (item.createType === 'chatbot') {
                    return workflowAgentFeatureType === '1' && !md.global?.SysSettings?.hideAIBasicFun;
                  }
                  return true;
                }).map((item, index) => (
                  <Fragment key={index}>
                    {item.createType === 'group' && <div className="spaceLine mTop4 mBottom4"></div>}
                    <MenuItem
                      key={item.createType}
                      onClick={() => {
                        handleSwitchCreateType(item.createType);
                      }}
                    >
                      {iconMaps[item.createType] ? (
                        <img className="createIcon" src={iconMaps[item.createType]} />
                      ) : (
                        <Icon
                          icon={item.icon}
                          className={cx('Font18', {
                            Visibility: ['worksheet', 'importExcel'].includes(item.createType),
                          })}
                        />
                      )}
                      <span className={item.className}>{item.text}</span>
                      {item.createType === 'chatbot' && (
                        <Icon icon="auto_awesome" className="Font15 mLeft5" style={{ color: '#9709f2' }} />
                      )}
                    </MenuItem>
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
        <CreateNew
          type={createType}
          onImportExcel={() => {
            handleSwitchCreateType('importExcel');
            setCreateType('');
          }}
          onCreate={handleCreate}
          onCancel={() => handleSwitchCreateType('')}
        />
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
