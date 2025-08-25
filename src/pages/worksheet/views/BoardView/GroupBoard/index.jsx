import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useDrop } from 'react-dnd-latest';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv, ScrollView } from 'ming-ui';
import GroupByControl from 'worksheet/components/GroupByControl';
import { getCardWidth } from 'src/utils/worksheet';
import ViewEmpty from '../../components/ViewEmpty';
import BoardTitle from '../components/BoardTitle';
import CustomDragLayer from '../components/CustomDragLayer';
import { ITEM_TYPE } from '../config';
import { canEditForGroupControl, dealBoardViewData, viewSortRecord } from '../util';
import { handleAutoScroll } from './core/autoScroll';
import { getGroupOpenKeys, getGroupOptions, groupByOptionKey } from './core/util';
import SecondGroupItem from './SecondGroupItem';
import './index.less';

const GroupBoardWrap = styled.div`
  .groupHeaderItemWrap,
  .secondGroupItemWrap {
    width: ${props => `${props.width}px`};
  }
`;

const GroupBoard = props => {
  const {
    appId,
    controls,
    view,
    boardView,
    worksheetInfo = {},
    showRecordInfo,
    addRecord,
    controlId,
    control,
    updateBoardViewSortedOptionKeys,
    ...rest
  } = props;
  const scrollViewRef = useRef();
  const isManualExpand = useRef(false);
  const [, drop] = useDrop({
    accept: ITEM_TYPE.RECORD,
    hover(props, monitor) {
      handleAutoScroll(scrollViewRef, monitor);
    },
  });
  const { boardViewLoading = true, boardData, boardViewRecordCount, boardViewCard, sortedOptionKeys } = boardView;
  const viewData = useMemo(() => {
    return dealBoardViewData({ view, controls, data: boardData }) || [];
  }, [view, controls.length, boardData]);

  // 判断一级分组是否有未指定，且未指定数量是否大于0
  const hasNoFirstGroup = _.get(_.find(viewData, { key: '-1' }), 'totalNum', 0) > 0;

  const { viewControl } = view;

  const firstGroupAllowAdd = useMemo(() => {
    const firstGroupControl = _.find(controls, item => item.controlId === viewControl);
    return firstGroupControl && firstGroupControl.type !== 30;
  }, [viewControl]);

  const groupOptions = useMemo(() => {
    return getGroupOptions(viewData, view, control, { sortedOptionKeys, updateBoardViewSortedOptionKeys });
  }, [viewData, view, controlId]);
  const firstGroupKeys = useMemo(() => viewData.map(group => group.key), [viewData]);

  const { groupViewData, secondGroupTotal } = useMemo(() => {
    return groupByOptionKey(viewData, view, control, groupOptions);
  }, [viewData, view, controlId, groupOptions]);

  const [openKeys, setOpenKeys] = useState([]);
  const [viewportClientW, setViewportClientW] = useState(500);
  const [viewport, setViewport] = useState(null);

  const selectControl = () => {
    return _.find(controls, item => item.controlId === viewControl);
  };

  const sortRecord = obj => {
    viewSortRecord(obj, view, props, selectControl, control);
  };

  const switchGroupControl = key => {
    setOpenKeys(!openKeys.includes(key) ? [...openKeys, key] : openKeys.filter(o => o !== key));
  };

  const renderBoardTitle = () => {
    return (
      <Fragment>
        {viewData.map(item => {
          if (item.key === '-1' && !hasNoFirstGroup) return;
          return (
            <div className="groupHeaderItemWrap">
              <BoardTitle
                count={boardViewRecordCount[item.key] || 0}
                showRecordInfo={showRecordInfo}
                keyType={item.key}
                selectControl={selectControl()}
                appId={appId}
                projectId={worksheetInfo.projectId}
                {..._.pick(item, ['name', 'type', 'key', 'color', 'enumDefault', 'enumDefault2', 'noGroup', 'rowId'])}
              />
            </div>
          );
        })}
      </Fragment>
    );
  };

  const renderGroupBoardContent = () => {
    return groupOptions.map((opt, optIndex) => {
      if (!_.has(groupViewData, opt.key)) return;
      const groupData = groupViewData[opt.key] || {};
      const allowOperation = canEditForGroupControl({
        allowAdd: worksheetInfo?.allowAdd,
        control,
      });
      return (
        <Fragment key={`group-${opt.key}`}>
          <GroupByControl
            className="groupByControl"
            style={{ width: viewportClientW }}
            allowAdd={allowOperation && firstGroupAllowAdd}
            appId={appId}
            projectId={worksheetInfo.projectId}
            worksheetId={props.worksheetId}
            view={view}
            viewId={props.viewId}
            folded={!openKeys.includes(opt.key)}
            allFolded={!openKeys.length}
            control={control}
            groupKey={opt.key}
            count={secondGroupTotal[opt.key]}
            name={opt.combination || opt.name || _l('未命名')}
            onFold={() => {
              isManualExpand.current = true;
              switchGroupControl(opt.key);
            }}
            onAllFold={value => {
              isManualExpand.current = true;
              setOpenKeys(value ? [] : groupOptions.map(item => item.key));
            }}
            onAdd={record => {
              const value = record[viewControl] || '';
              const key = firstGroupKeys.find(item => item !== '-1' && value.includes(item)) ?? '-1';
              addRecord({ item: record, key });
            }}
          />
          {openKeys.includes(opt.key) && (
            <div className="secondGroupRow" key={`secondGroupRow-${opt.key}`}>
              {firstGroupKeys.map((groupKey, groupIndex) => {
                if (groupKey === '-1' && !hasNoFirstGroup) return;
                return (
                  <SecondGroupItem
                    key={`secondGroupItem-${opt.key}-${optIndex}-${groupKey}-${groupIndex}`}
                    mapRowKey={`${opt.key}-${groupKey}`}
                    secondGroupControlId={controlId}
                    secondGroupOpt={opt}
                    items={groupData[groupKey] || []}
                    list={viewData[groupIndex]}
                    control={control}
                    groupOptions={groupOptions}
                    view={view}
                    boardData={boardData}
                    worksheetInfo={worksheetInfo}
                    viewControl={viewControl}
                    selectControl={selectControl}
                    addRecord={addRecord}
                    sortRecord={sortRecord}
                    viewData={viewData}
                    allowOperation={allowOperation && firstGroupAllowAdd}
                    currentGroupKey={opt.key}
                    viewRootEl={viewport}
                    boardViewCard={boardViewCard}
                    {..._.pick(props, ['sheetSwitchPermit', 'updateTitleData', 'sheetButtons', 'fieldShowCount'])}
                    {...rest}
                  />
                );
              })}
            </div>
          )}
        </Fragment>
      );
    });
  };

  useEffect(() => {
    // 如果手动改变过折叠，则保持展开项不变
    if (!isManualExpand.current) {
      setOpenKeys(getGroupOpenKeys(groupOptions, view, groupViewData, control));
    }
  }, [groupOptions?.length, groupViewData]);

  // 初始配置
  useEffect(() => {
    // 配置项改变后，重置状态
    isManualExpand.current = false;
    setOpenKeys(getGroupOpenKeys(groupOptions, view, groupViewData, control));
  }, [control.type, view.advancedSetting.groupopen, view.advancedSetting.groupshow]);

  useEffect(() => {
    if (scrollViewRef.current) {
      const viewport = scrollViewRef.current.getScrollInfo().viewport || {};
      setViewport(viewport);
      setViewportClientW(viewport.clientWidth || 500);
    }
  }, [boardViewLoading]);

  if (boardViewLoading) return <LoadDiv />;

  if (_.every(Object.values(boardViewRecordCount), val => !val)) {
    return <ViewEmpty />;
  }

  return (
    <GroupBoardWrap
      className="groupBoardWrap"
      width={view?.advancedSetting?.cardwidth ? getCardWidth(view) : 280}
      ref={drop}
    >
      <ScrollView className="groupBoardScroll" ref={scrollViewRef}>
        <div className="groupBoardHeader">{renderBoardTitle()}</div>
        <div className="groupBoardContent">{renderGroupBoardContent()}</div>
      </ScrollView>
      <CustomDragLayer />
    </GroupBoardWrap>
  );
};

export default GroupBoard;
