import React, { Fragment, lazy, Suspense, useEffect, useState } from 'react';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Dropdown, Tooltip } from 'ming-ui/antd-components';
import chatbotIcon from './assets/chatbot.png';
import customPageIcon from './assets/dashboard.png';
import worksheetIcon from './assets/worksheet.png';
import CreateNew from './CreateNew';
import { CREATE_ITEM_LIST } from './enum';

const LoadableDialogImportExcelCreate = lazy(() => import('worksheet/components/DialogImportExcelCreate'));

const iconMaps = {
  worksheet: worksheetIcon,
  customPage: customPageIcon,
  chatbot: chatbotIcon,
};

export default function CreateAppItem(props) {
  const { isCharge, isUnfold, projectId, appId, groupId, appPkg = {} } = props;
  const { sheetListActions, getSheetList } = props;
  const { workflowAgentFeatureType } = appPkg;
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

  const createMenuItems = CREATE_ITEM_LIST.filter(item => {
    if (item.createType === 'chatbot') {
      return workflowAgentFeatureType === '1' && !md.global.SysSettings.hideAIBasicFun;
    }

    return true;
  }).reduce((items, item) => {
    if (item.createType === 'group') {
      items.push({ key: 'createDivider', type: 'divider', className: 'mTop4 mBottom4' });
    }

    items.push({
      key: item.createType,
      icon: iconMaps[item.createType] ? (
        <img className="createIcon" style={{ width: 20 }} src={iconMaps[item.createType]} />
      ) : (
        <Icon
          icon={item.icon}
          className={cx('Font18 textTertiary', {
            Visibility: ['worksheet', 'importExcel'].includes(item.createType),
          })}
        />
      ),
      label: (
        <Fragment>
          <span className={item.className}>{item.text}</span>
          {item.createType === 'chatbot' && (
            <Icon icon="auto_awesome" className="Font15 mLeft5" style={{ color: 'var(--color-mingo-light)' }} />
          )}
        </Fragment>
      ),
      onClick: () => {
        handleSwitchCreateType(item.createType);
      },
    });

    return items;
  }, []);

  return (
    <Fragment>
      {isCharge && (
        <Dropdown
          trigger={['click']}
          open={createMenuVisible}
          onOpenChange={setCreateMenuVisible}
          placement="bottomLeft"
          align={{ offset: [0, 0] }}
          classNames={{ root: 'createNewMenu' }}
          menu={{
            items: createMenuItems,
            style: { minWidth: 240 },
          }}
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
        </Dropdown>
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
        <Suspense fallback={null}>
          <LoadableDialogImportExcelCreate
            projectId={projectId}
            appId={appId}
            groupId={groupId}
            onCancel={() => setDialogImportExcel(false)}
            createType="worksheet"
            refreshPage={() => {
              getSheetList({ appId, appSectionId: groupId });
            }}
          />
        </Suspense>
      )}
    </Fragment>
  );
}
