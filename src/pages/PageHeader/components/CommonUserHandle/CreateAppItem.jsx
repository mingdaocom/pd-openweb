import React, { Fragment, lazy, Suspense, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import chatbotIcon from 'worksheet/common/WorkSheetLeft/assets/chatbot.png';
import customPageIcon from 'worksheet/common/WorkSheetLeft/assets/dashboard.png';
import worksheetIcon from 'worksheet/common/WorkSheetLeft/assets/worksheet.png';
import CreateNew from 'worksheet/common/WorkSheetLeft/CreateNew';
import { addFirstAppSection, createAppItem, getSheetList } from 'worksheet/redux/actions/sheetList';
import { getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';
import { CREATE_ITEM_LIST } from 'src/pages/worksheet/common/WorkSheetLeft/enum';
import { findSheet } from 'src/utils/domain/worksheet/helpers';

const LoadableDialogImportExcelCreate = lazy(() => import('worksheet/components/DialogImportExcelCreate'));

const iconMaps = {
  worksheet: worksheetIcon,
  customPage: customPageIcon,
  chatbot: chatbotIcon,
};

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

  useEffect(() => {
    window.__worksheetLeftReLoad = () => {
      singleRef.dispatch(
        getSheetList({ appId, appSectionId: appItem ? appItem.parentGroupId || appItem.parentId : groupId }),
      );
    };

    return () => {
      delete window.__worksheetLeftReLoad;
    };
  }, [appId, appItem, groupId, singleRef]);

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

  const createMenuItems = CREATE_ITEM_LIST.filter(item => {
    if (item.createType === 'chatbot') {
      return workflowAgentFeatureType === '1' && !md.global?.SysSettings?.hideAIBasicFun;
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
          {children}
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
            groupId={appItem ? appItem.parentGroupId || appItem.parentId : groupId}
            onCancel={() => setDialogImportExcel(false)}
            createType="worksheet"
            refreshPage={() => {
              singleRef.dispatch(
                getSheetList({ appId, appSectionId: appItem ? appItem.parentGroupId || appItem.parentId : groupId }),
              );
            }}
          />
        </Suspense>
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
