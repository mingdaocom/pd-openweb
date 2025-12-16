import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { ScrollView } from 'ming-ui';
import GroupByControl from 'mobile/components/GroupByControl';
import { getGroupOpenKeys, getGroupOptions, groupByOptionKey } from 'worksheet/views/BoardView/GroupBoard/core/util';
import { canEditForGroupControl, dealBoardViewData } from 'worksheet/views/BoardView/util';
import { getCardWidth } from 'src/utils/worksheet';
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
    worksheetId,
    viewId,
    openRecord,
    addBoardViewRecord,
    controlId, // 二级分组字段id
    control, // 二级分组的字段
  } = props;
  const scrollViewRef = useRef(null);
  const { boardData, boardViewRecordCount } = boardView;
  const viewData = dealBoardViewData({ view, controls, data: boardData }) || [];
  // 判断一级分组是否有未指定，且未指定数量是否大于0
  const hasNoFirstGroup = _.get(_.find(viewData, { key: '-1' }), 'totalNum', 0) > 0;
  // 一级分组字段id
  const { viewControl } = view;
  const groupOptions = useMemo(() => {
    return getGroupOptions(viewData, view, control) || [];
  }, [viewData, view, controlId]);
  const firstGroupKeys = useMemo(() => viewData.map(group => group.key), [viewData]);

  const { groupViewData, secondGroupTotal } = useMemo(() => {
    return groupByOptionKey(viewData, view, control, groupOptions);
  }, [viewData, view, controlId, groupOptions]);

  const [openKeys, setOpenKeys] = useState([]);
  const [viewport, setViewport] = useState(null);

  const selectControl = () => {
    return _.find(controls, item => item.controlId === viewControl);
  };

  const renderBoardTitle = () => {
    return (
      <Fragment>
        {viewData.map(item => {
          if (item.key === '-1' && !hasNoFirstGroup) return;
          return (
            <div className="groupHeaderItemWrap">
              <GroupByControl
                className="firstGroup"
                canFold={false}
                appId={appId}
                worksheetId={worksheetId}
                viewId={viewId}
                control={selectControl()}
                groupKey={item.key}
                count={boardViewRecordCount[item.key] || 0}
                customEmptyName={item.key === '-1' ? _l('未指定') : ''}
                {..._.pick(item, ['name'])}
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
            appId={appId}
            worksheetId={worksheetId}
            viewId={viewId}
            folded={!openKeys.includes(opt.key)}
            allFolded={!openKeys.length}
            view={view}
            control={control}
            groupKey={opt.key}
            count={secondGroupTotal[opt.key]}
            name={opt.combination || opt.name || _l('未命名')}
            onFold={() => {
              setOpenKeys(!openKeys.includes(opt.key) ? [...openKeys, opt.key] : openKeys.filter(o => o !== opt.key));
            }}
          />

          {openKeys.includes(opt.key) && (
            <div className="secondGroupRow" key={`secondGroupRow-${opt.key}`}>
              {firstGroupKeys.map((groupKey, groupIndex) => {
                if (groupKey === '-1' && !hasNoFirstGroup) return;
                return (
                  <SecondGroupItem
                    key={`secondGroupItem-${opt.key}-${optIndex}-${groupKey}-${groupIndex}`}
                    groupKey={groupKey}
                    mapRowKey={`${opt.key}-${groupKey}`}
                    viewControl={viewControl}
                    secondGroupControlId={controlId}
                    secondGroupOpt={opt}
                    items={groupData[groupKey] || []}
                    list={viewData[groupIndex]}
                    control={control}
                    view={view}
                    boardData={boardData}
                    worksheetInfo={worksheetInfo}
                    selectControl={selectControl}
                    controls={controls}
                    openRecord={openRecord}
                    addBoardViewRecord={addBoardViewRecord}
                    viewData={viewData}
                    allowOperation={allowOperation}
                    viewRootEl={viewport}
                    {..._.pick(props, ['appId', 'sheetSwitchPermit', 'updateViewCard', 'delBoardViewRecord'])}
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
    setOpenKeys(getGroupOpenKeys(groupOptions, view, groupViewData, control));
  }, [groupOptions?.length, view.advancedSetting.groupopen]);

  useEffect(() => {
    if (scrollViewRef.current) {
      const viewport = scrollViewRef.current.getScrollInfo().viewport || {};
      setViewport(viewport);
    }
  }, []);

  return (
    <GroupBoardWrap
      className="mobileGroupBoardWrap"
      width={view?.advancedSetting?.cardwidth ? getCardWidth(view) : 280}
    >
      <ScrollView
        className="groupBoardScroll"
        options={{ overflow: { x: 'hidden' }, scrollbars: { visibility: 'hidden' } }}
        ref={scrollViewRef}
        springBackMode="disableSpringBackY"
      >
        <div className="scaleContainer">
          <div className="scaleContent">
            <ScrollView options={{ scrollbars: { visibility: 'hidden' } }} springBackMode="disableSpringBackX">
              <div className="groupBoardHeader">{renderBoardTitle()}</div>
              <div className="groupBoardContent">{renderGroupBoardContent()}</div>
            </ScrollView>
          </div>
        </div>
      </ScrollView>
    </GroupBoardWrap>
  );
};

export default GroupBoard;
