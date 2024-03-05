import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Tooltip, Icon, Menu, MenuItem } from 'ming-ui';
import DialogImportExcelCreate from 'worksheet/components/DialogImportExcelCreate';
import CreateNew from './CreateNew';
import cx from 'classnames';
import Trigger from 'rc-trigger';

const subList = [
  { icon: 'plus', text: _l('从空白创建%02008'), createType: 'worksheet' },
  { icon: 'new_excel', text: _l('从Excel创建%02007'), createType: 'importExcel' },
];
const CREATE_ITEM_LIST = [
  // { icon: 'table', text: _l('工作表'), createType: 'selectWorksheet', subList },
  { icon: 'plus', text: _l('从空白创建%02008'), createType: 'worksheet' },
  { icon: 'new_excel', text: _l('从Excel创建%02007'), createType: 'importExcel' },
  { icon: 'dashboard', text: _l('创建自定义页面%02006'), createType: 'customPage' },
  { icon: 'add-files', text: _l('分组%02005'), createType: 'group' },
];

export default function CreateAppItem(props) {
  const { isCharge, isUnfold, projectId, appId, groupId } = props;
  const { sheetListActions, getSheetList } = props;
  const [createMenuVisible, setCreateMenuVisible] = useState(false);
  const [createType, setCreateType] = useState('');
  const [dialogImportExcel, setDialogImportExcel] = useState(false);

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
      ...args
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
              <Menu>
                {CREATE_ITEM_LIST.map((item, index) => (
                  <Fragment key={index}>
                    {item.createType === 'customPage' && <div className="spaceLine mTop4 mBottom4"></div>}
                    {item.createType === 'worksheet' && (
                      <div className="Gray_9e pLeft12 pTop7 pBottom3">{_l('工作表')}</div>
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
          <div
            id="createCustomItem"
            className={cx('newWorkSheet pAll12 pLeft15 pointer mLeft2', { active: createMenuVisible })}
          >
            <Tooltip disable={isUnfold} popupPlacement="right" text={<span>{_l('新建')}</span>}>
              <Icon icon="add" className="mRight10 Font20 pointer" />
            </Tooltip>
            <span className="Font14 text">{_l('新建')}</span>
          </div>
        </Trigger>
      )}
      {!!createType && (
        <CreateNew type={createType} onCreate={handleCreate} onCancel={() => handleSwitchCreateType('')} />
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
