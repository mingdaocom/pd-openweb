import React, { Fragment, useEffect, useRef, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { ScrollView } from 'ming-ui';
import GroupByControl from 'mobile/components/GroupByControl';
import { dealBoardViewData } from 'worksheet/views/BoardView/util';
import { getCardWidth } from 'src/utils/worksheet';
import RecordList from './RecordList';
import './index.less';

const GroupBoardWrap = styled.div`
  .groupHeaderItemWrap,
  .commonGroupItemWrap {
    width: ${props => `${props.width}px`};
  }
`;

const CommonBoard = props => {
  const {
    appId,
    controls,
    view,
    boardView,
    worksheetInfo = {},
    sheetSwitchPermit,
    worksheetId,
    viewId,
    getSingleBoardGroup,
    openRecord,
    addBoardViewRecord,
    loadBoardViewNextGroup,
  } = props;
  const scrollViewRef = useRef(null);

  const { boardData, boardViewRecordCount } = boardView;
  const viewData = dealBoardViewData({ view, controls, data: boardData });

  // 一级分组字段ids
  const { viewControl } = view;

  const [pending, setPending] = useState(false);
  const [viewport, setViewport] = useState(null);

  const selectControl = () => {
    return _.find(controls, item => item.controlId === viewControl);
  };

  const onReachHorizontalEdge = ({ direction }) => {
    if (direction === 'right' && !pending) {
      setPending(true);
      loadBoardViewNextGroup({
        callback: () => setPending(false),
      });
    }
  };

  const renderBoardTitle = () => {
    return (
      <Fragment>
        {viewData.map(item => {
          if (item.key === '-1' && !item.rows?.length) return;
          return (
            <div className="groupHeaderItemWrap">
              <GroupByControl
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
    return (
      <Fragment>
        {viewData.map(item => {
          if (item.key === '-1' && !item.rows?.length) return;
          return (
            <RecordList
              key={`recordItem-${item.key}`}
              itemFirstGroup={item}
              view={view}
              appId={appId}
              worksheetId={worksheetId}
              controls={controls}
              sheetSwitchPermit={sheetSwitchPermit}
              worksheetInfo={worksheetInfo}
              getSingleBoardGroup={getSingleBoardGroup}
              openRecord={openRecord}
              boardData={boardData}
              addBoardViewRecord={addBoardViewRecord}
              viewData={viewData}
              viewRootEl={viewport}
              {..._.pick(props, ['updateViewCard', 'delBoardViewRecord'])}
            />
          );
        })}
      </Fragment>
    );
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      const viewport = scrollViewRef.current.getScrollInfo().viewport || {};
      setViewport(viewport);
    }
  }, []);

  return (
    <GroupBoardWrap
      className="mobileCommonBoardWrap"
      width={view?.advancedSetting?.cardwidth ? getCardWidth(view) : 280}
    >
      <ScrollView
        className="commonBoardScroll"
        ref={scrollViewRef}
        disableSpringBack
        allowance={50}
        options={{ overflow: { y: 'hidden' } }}
        springBackMode="disableSpringBackX"
        onReachHorizontalEdge={onReachHorizontalEdge}
      >
        <div className="scaleContainer">
          <div className="scaleContent">
            <div className="commonBoardHeader">{renderBoardTitle()}</div>
            <div className="commonBoardContent">{renderGroupBoardContent()}</div>
          </div>
        </div>
      </ScrollView>
    </GroupBoardWrap>
  );
};

export default CommonBoard;
