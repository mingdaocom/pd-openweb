import React, { Fragment, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import { DndProvider } from 'react-dnd-latest';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, ScrollView, SvgIcon, Tooltip } from 'ming-ui';
import homeAppApi from 'src/api/homeApp';
import WorksheetEmpty from 'worksheet/common/WorksheetEmpty/WorksheetEmpty';
import * as sheetListActions from 'src/pages/worksheet/redux/actions/sheetList';
import { canEditApp } from 'src/pages/worksheet/redux/actions/util';
import { getTranslateInfo } from 'src/utils/app';
import CreateAppItem from '../WorkSheetLeft/CreateAppItem';
import Drag from '../WorkSheetLeft/Drag';
import MoreOperation from '../WorkSheetLeft/MoreOperation';
import AppItem from './AppItem';
import './index.less';

const WorkSheetPortal = props => {
  const { appId, groupId, isCharge, projectId, loading, appPkg } = props;
  const { sheetListActions } = props;
  const [editId, setEditId] = useState('');
  const filterEmptyAppItem = isCharge ? () => true : item => !(item.type === 2 && _.isEmpty(item.items));
  const data =
    isCharge && appPkg.viewHideNavi
      ? props.data
      : props.data.filter(item => [1, 4].includes(item.status) && !item.navigateHide).filter(filterEmptyAppItem);
  const ref = useRef(null);
  const isEditApp = canEditApp(_.get(appPkg, ['permissionType']), _.get(appPkg, ['isLock']));

  const getSheetList = () => {
    sheetListActions.getSheetList({
      appId,
      appSectionId: groupId,
    });
  };

  useEffect(getSheetList, [groupId]);

  const handleSaveName = (e, id) => {
    setEditId('');
    const workSheetName = e.target.value.slice(0, 100) || _l('未命名分组');
    homeAppApi
      .updateAppSection({
        appId,
        appSectionId: id,
        appSectionName: workSheetName,
      })
      .then(() => {
        sheetListActions.updateSheetListAppItem(id, { workSheetName, edit: false });
      })
      .catch(() => {
        alert(_l('修改分组名称失败'), 2);
      });
  };

  const handleFocus = () => {
    setTimeout(() => {
      ref && ref.current && ref.current.select();
    }, 0);
  };

  const workSheetItemProps = {
    appId,
    groupId,
    sheetList: data,
    sheetListActions,
    isCharge,
    appPkg,
    projectId,
  };

  const renderGroupItem = item => {
    const appItem = {
      ...item,
      layerIndex: 1,
      isAppItem: item.type !== 2,
      parentId: groupId,
    };
    const Wrap = item.notMore ? Fragment : Drag;
    const isEdit = editId === appItem.workSheetId || item.edit;
    const items = item.items || [];
    const showIcon = (_.get(appPkg, 'displayIcon') || '').split('')[1] === '1';

    const renderIcon = () => {
      let icon = 'visibility_off';
      if (item.status === 3) {
        icon = 'desktop_off';
      }
      if (item.status === 4) {
        icon = 'mobile_off';
      }
      return (
        [2, 3, 4].includes(item.status) && (
          <Tooltip
            popupPlacement="bottom"
            autoCloseDelay={0}
            text={<span>{_l('仅系统角色可见（包含管理员、开发者）')}</span>}
          >
            <Icon className="Font16 mLeft10 pointer visibilityIcon" icon={icon} style={{ color: '#ee6f09' }} />
          </Tooltip>
        )
      );
    };

    return (
      <div key={item.workSheetId} className="flexColumn mBottom40 groupWrap">
        <Wrap appItem={appItem} appPkg={appPkg} isCharge={isCharge} onlyIconDrag={!item.notMore}>
          <div
            className={cx('flexRow alignItemsCenter mBottom20 groupHeader', `workSheetItem-${item.workSheetId}`, {
              editWrap: isEdit,
            })}
          >
            {isCharge && !item.notMore && <Icon icon="drag" className="Gray_9e pointer Font16 dragIcon" />}
            {isEdit ? (
              <input
                autoFocus
                ref={ref}
                className="resetNameInput"
                defaultValue={item.workSheetName}
                onBlur={e => {
                  handleSaveName(e, item.workSheetId);
                }}
                onFocus={handleFocus}
                onKeyDown={e => {
                  e.which === 13 && handleSaveName(e, item.workSheetId);
                }}
              />
            ) : (
              <Fragment>
                {showIcon && !item.notMore && (
                  <SvgIcon
                    size={20}
                    url={
                      item.iconUrl ? item.iconUrl : `${md.global.FileStoreConfig.pubHost}customIcon/${item.icon}.svg`
                    }
                    fill={'#151515'}
                    className="mRight5"
                  />
                )}
                <div className="Font16 bold">
                  {getTranslateInfo(appId, null, item.workSheetId).name || item.workSheetName}
                </div>
                {isEditApp && renderIcon()}
                {isCharge && !item.notMore && (
                  <MoreOperation isGroup appItem={appItem} onChangeEdit={setEditId} {...props}>
                    <div className="moreIcon mLeft10">
                      <Icon icon="more_horiz" className="Font18 pointer Gray_9e" />
                    </div>
                  </MoreOperation>
                )}
              </Fragment>
            )}
          </div>
          <div className="flexRow groupContent">
            {(isCharge && appPkg.viewHideNavi
              ? items
              : items.filter(item => [1, 4].includes(item.status) && !item.navigateHide)
            ).map((data, index) => (
              <AppItem
                key={data.workSheetId}
                appItem={{
                  ...data,
                  layerIndex: item.layerIndex || 2,
                  isAppItem: data.type !== 2,
                  parentId: item.workSheetId,
                  parentStatus: item.status,
                  index,
                }}
                {...workSheetItemProps}
              />
            ))}
          </div>
        </Wrap>
      </div>
    );
  };

  const secondLevelGroupData = data.filter(item => item.type === 2);
  const otherData = data.filter(item => item.type !== 2);

  const renderContent = () => {
    if (loading) {
      return <LoadDiv />;
    }
    if (_.isEmpty(data)) {
      return <WorksheetEmpty appId={appId} groupId={groupId} />;
    }

    return (
      <div className="WorkSheetPortal flexColumn w100 h100 minHeight0">
        <div className="flex minHeight0">
          <DndProvider key="navigationList" context={window} backend={HTML5Backend}>
            <ScrollView>
              {secondLevelGroupData.map(item => renderGroupItem(item))}
              {!!otherData.length &&
                renderGroupItem({
                  workSheetId: groupId,
                  workSheetName: !!secondLevelGroupData.length && _l('其他'),
                  items: otherData,
                  layerIndex: 1,
                  notMore: true,
                })}
            </ScrollView>
          </DndProvider>
        </div>
        <div className="flexRow alignItemsCenter createAppItem">
          <div className="groupWrap">
            <CreateAppItem
              isCharge={isCharge}
              isUnfold={true}
              projectId={projectId}
              appId={appId}
              groupId={groupId}
              sheetListActions={sheetListActions}
              getSheetList={getSheetList}
            />
          </div>
        </div>
      </div>
    );
  };

  return <div className="flexColumn w100 h100">{renderContent()}</div>;
};

const mapDispatchToProps = dispatch => ({
  sheetListActions: bindActionCreators(sheetListActions, dispatch),
  dispatch,
});

const mapStateToProps = state => ({
  data: state.sheetList.data,
  loading: state.sheetList.loading,
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkSheetPortal);
