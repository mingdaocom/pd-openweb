import React, { Component, Fragment, useState, useEffect, useRef } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Icon, LoadDiv, ScrollView, Tooltip } from 'ming-ui';
import { DndProvider } from 'react-dnd-latest';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import * as sheetListActions from 'src/pages/worksheet/redux/actions/sheetList';
import cx from 'classnames';
import WorksheetEmpty from 'worksheet/common/WorksheetEmpty/WorksheetEmpty';
import CreateAppItem from '../WorkSheetLeft/CreateAppItem';
import MoreOperation from '../WorkSheetLeft/MoreOperation';
import Drag from '../WorkSheetLeft/Drag';
import AppItem from './AppItem';
import homeAppApi from 'src/api/homeApp';
import './index.less';

const WorkSheetPortal = (props) => {
  const { appId, groupId, isCharge, projectId, loading, appPkg } = props;
  const { sheetListActions } = props;
  const [editId, setEditId] = useState('');
  const [wrapWidth, setWrapWidth] = useState(0);
  const filterEmptyAppItem = isCharge ? item => true : item => !(item.type === 2 && _.isEmpty(item.items));
  const data = isCharge && appPkg.viewHideNavi ? props.data : props.data.filter(item => item.status === 1 && !item.navigateHide).filter(filterEmptyAppItem);
  const ref = useRef(null);

  const getSheetList = () => {
    sheetListActions.getSheetList({
      appId,
      appSectionId: groupId,
    });
  }

  useEffect(getSheetList, [groupId]);

  const handleSaveName = (e, id) => {
    setEditId('');
    const workSheetName = e.target.value.slice(0, 100) || _l('未命名分组');
    homeAppApi.updateAppSection({
      appId,
      appSectionId: id,
      appSectionName: workSheetName,
    }).then(data => {
      sheetListActions.updateSheetListAppItem(id, { workSheetName, edit: false });
    }).fail(err => {
      alert(_l('修改分组名称失败'), 2);
    });
  }

  const handleFocus = (e) => {
    setTimeout(() => {
      ref && ref.current && ref.current.select();
    }, 0);
  }

  const workSheetItemProps = {
    appId,
    groupId,
    sheetList: data,
    sheetListActions,
    isCharge,
    appPkg,
    projectId
  }

  const renderGroupItem = (item) => {
    const appItem = {
      ...item,
      layerIndex: 1,
      isAppItem: item.type !== 2,
      parentId: groupId
    }
    const Wrap = item.notMore ? Fragment : Drag;
    const isEdit = editId === appItem.workSheetId || item.edit;
    const items = item.items || [];
    return (
      <div key={item.workSheetId} className="flexColumn mBottom40 groupWrap">
        <Wrap
          appItem={appItem}
          appPkg={appPkg}
          isCharge={isCharge}
          onlyIconDrag={!item.notMore}
        >
          <div className={cx('flexRow alignItemsCenter mBottom20 groupHeader', `workSheetItem-${item.workSheetId}`, { editWrap: isEdit })}>
            {isCharge && !item.notMore && (
              <Icon icon="drag" className="Gray_9e pointer Font16 dragIcon" />
            )}
            {isEdit ? (
              <input
                autoFocus
                ref={ref}
                className="resetNameInput"
                defaultValue={item.workSheetName}
                onBlur={(e) => {
                  handleSaveName(e, item.workSheetId);
                }}
                onFocus={handleFocus}
                onKeyDown={e => {
                  e.which === 13 && handleSaveName(e, item.workSheetId);
                }}
              />
            ) : (
              <Fragment>
                <div className="Font16 bold">{item.workSheetName}</div>
                {item.status === 2 && (
                  <Tooltip popupPlacement="bottom" text={<span>{_l('仅系统角色可见（包含管理员、运营者、开发者）')}</span>}>
                    <Icon className="Font16 mLeft10 pointer visibilityIcon" icon="visibility_off" style={{ color: '#ee6f09' }} />
                  </Tooltip>
                )}
                {isCharge && !item.notMore && (
                  <MoreOperation
                    isGroup
                    appItem={appItem}
                    onChangeEdit={setEditId}
                    {...props}
                  >
                    <div className="moreIcon mLeft10">
                      <Icon icon="more_horiz" className="Font18 pointer Gray_9e" />
                    </div>
                  </MoreOperation>
                )}
              </Fragment>
            )}
          </div>
          <div className="flexRow groupContent">
            {(isCharge && appPkg.viewHideNavi ? items : items.filter(item => item.status === 1 && !item.navigateHide)).map((data, index) => (
              <AppItem
                key={data.workSheetId}
                appItem={{
                  ...data,
                  layerIndex: item.layerIndex || 2,
                  isAppItem: data.type !== 2,
                  parentId: item.workSheetId,
                  parentStatus: item.status,
                  index
                }}
                {...workSheetItemProps}
              />
            ))}
          </div>
        </Wrap>
      </div>
    );
  }

  const secondLevelGroupData = data.filter(item => item.type === 2);
  const otherData = data.filter(item => item.type !== 2);

  const renderContent = () => {
    if (loading) {
      return (
        <LoadDiv />
      );
    }
    if (_.isEmpty(data)) {
      return (
        <WorksheetEmpty
          appId={appId}
          groupId={groupId}
        />
      )
    }

    return (
      <div className="WorkSheetPortal flexColumn w100 h100">
        <div className="flex">
          <DndProvider key="navigationList" context={window} backend={HTML5Backend}>
            <ScrollView>
              {secondLevelGroupData.map(item => renderGroupItem(item))}
              {!!otherData.length && renderGroupItem({
                workSheetId: groupId,
                workSheetName: !!secondLevelGroupData.length && _l('其他'),
                items: otherData,
                layerIndex: 1,
                notMore: true
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
  }

  return (
    <div className="flexColumn w100 h100">
      {renderContent()}
    </div>
  );
}

const mapDispatchToProps = dispatch => ({
  sheetListActions: bindActionCreators(sheetListActions, dispatch),
  dispatch,
});

const mapStateToProps = state => ({
  data: state.sheetList.data,
  loading: state.sheetList.loading,
});

export default connect(mapStateToProps, mapDispatchToProps)(WorkSheetPortal);
