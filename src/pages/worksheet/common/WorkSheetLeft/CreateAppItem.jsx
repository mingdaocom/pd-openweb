import React, { Fragment, useEffect, useState } from 'react';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import { Icon, Menu, MenuItem } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import DialogImportExcelCreate from 'worksheet/components/DialogImportExcelCreate';
import chatbotIcon from './assets/chatbot.png';
import customPageIcon from './assets/dashboard.png';
import worksheetIcon from './assets/worksheet.png';
import CreateNew from './CreateNew';
import { CREATE_ITEM_LIST } from './enum';

export default function CreateAppItem(props) {
  const { isCharge, isUnfold, projectId, appId, groupId, appPkg = {} } = props;
  const { sheetListActions, getSheetList } = props;
  const { workflowAgentFeatureType } = appPkg;
  const [createMenuVisible, setCreateMenuVisible] = useState(false);
  const [createType, setCreateType] = useState('');
  const [dialogImportExcel, setDialogImportExcel] = useState(false);
  const iconMaps = {
    worksheet: worksheetIcon,
    customPage: customPageIcon,
    chatbot: chatbotIcon,
  };

  useEffect(() => {
    window.__worksheetLeftReLoad = getSheetList;
    return () => {
      delete window.__worksheetLeftReLoad;
    };
  }, []);

  const handleCreate = (type, args) => {
    sheetListActions.createAppItem({
      appId,
      groupId,
      type,
      ...args,
    });
    setCreateType('');
  };

  const handleSwitchCreateType = type => {
    if (type === 'importExcel') {
      setCreateMenuVisible(false);
      setDialogImportExcel(true);
      return;
    }
    if (type === 'group') {
      sheetListActions.addAppSection({
        appId,
        groupId,
      });
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
            offset: [10, 0],
            overflow: {
              adjustX: true,
              adjustY: true,
            },
          }}
          popup={
            <div className="createNewMenu">
              <Menu className="createNewOperate">
                {CREATE_ITEM_LIST.filter(item => {
                  if (item.createType === 'chatbot') {
                    return workflowAgentFeatureType === '1' && !md.global.SysSettings.hideAIBasicFun;
                  }
                  return true;
                }).map((item, index) => (
                  <Fragment key={index}>
                    {item.createType === 'group' && <div className="spaceLine mTop4 mBottom4"></div>}
                    {/* {item.createType === 'worksheet' && (
                      <div className="flexRow alignItemsCenter pLeft16 pTop7 pBottom3">
                        <img className="createIcon" src={worksheetIcon} />
                        <span class="mLeft5 bold Font14">{_l('工作表')}</span>
                      </div>
                    )} */}
                    <MenuItem
                      data-event={item.createType}
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
          <div
            id="createCustomItem"
            className={cx('newWorkSheet pAll12 pLeft15 pointer mLeft2', { active: createMenuVisible })}
          >
            <Tooltip placement="right" title={isUnfold ? '' : <span>{_l('新建')}</span>}>
              <Icon icon="add" className="mRight10 Font20 pointer" />
            </Tooltip>
            <span className="Font14 text">{_l('新建')}</span>
          </div>
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
          groupId={groupId}
          onCancel={() => setDialogImportExcel(false)}
          createType="worksheet"
          refreshPage={() => {
            getSheetList({ appId, appSectionId: groupId });
          }}
        />
      )}
    </Fragment>
  );
}
