import React, { useEffect, useMemo, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { HTML5Backend } from 'react-dnd-html5-backend-latest';
import { DndProvider } from 'react-dnd-latest';
import _ from 'lodash';
import * as baseAction from 'src/pages/worksheet/redux/actions';
import * as boardActions from 'src/pages/worksheet/redux/actions/boardView';
import { setSysWorkflowTimeControlFormat } from 'src/pages/worksheet/views/CalendarView/util';
import { getAdvanceSetting } from 'src/utils/control';
import CommonBoard from './CommonBoard';
import GroupBoard from './GroupBoard';
import { getViewSelectFields, hasSecondGroupControl } from './util';

const BoardView = props => {
  const {
    viewId,
    view,
    initBoardViewData,
    navGroupFilters,
    controls,
    worksheetInfo,
    updateBoardViewSortedOptionKeys,
    sheetSwitchPermit,
  } = props;
  const { viewControl } = view;
  const { groupsetting } = getAdvanceSetting(view);
  // 一级分组有字段，且未被删除
  const isFirstGroupValidField =
    viewControl &&
    _.find(setSysWorkflowTimeControlFormat(controls, sheetSwitchPermit), item => item.controlId === viewControl);
  // 二级分组字段id
  const controlId = useMemo(() => {
    return (safeParse(groupsetting)[0] || {}).controlId;
  }, [JSON.stringify(view.advancedSetting.groupsetting)]);
  // 二级分组的字段
  const control = _.find(controls, item => item.controlId === controlId) || {};
  const cache = useRef({});
  // 二级分组字段是否有效
  const isValidField = !!control && getViewSelectFields(controls, worksheetInfo, view).find(o => o.value === controlId);
  // 是否有二级分组
  const hasSecondGroup = groupsetting && viewControl && isValidField && hasSecondGroupControl(groupsetting, controls);
  const [viewCardUpdateMap, setViewCardHeightMap] = useState({});

  const updateBoardViewCard = (rowid, height) => {
    if (viewCardUpdateMap[rowid] === height) return;
    setViewCardHeightMap(prev => ({
      ...prev,
      [rowid]: height,
    }));
  };

  useEffect(() => {
    if (
      cache.current.prevColorId &&
      view.advancedSetting.colorid &&
      view.advancedSetting.colorid !== cache.current.prevColorId
    ) {
      // 修改颜色字段时晚一点取, 不然返回的数据还是不包括新改的字段的值
      setTimeout(() => {
        initBoardViewData(view, hasSecondGroup);
      }, 200);
    } else {
      initBoardViewData(view, hasSecondGroup);
    }
    cache.current.prevColorId = view.advancedSetting.colorid;
    setViewCardHeightMap({});
    updateBoardViewSortedOptionKeys([]);
  }, [
    viewId,
    view.viewControl,
    view.coverCid,
    view.advancedSetting.navshow,
    JSON.stringify(view.advancedSetting.navfilters),
    view.advancedSetting.freezenav,
    view.advancedSetting.navempty,
    JSON.stringify(view.moreSort),
    view.advancedSetting.colorid,
    JSON.stringify(navGroupFilters),
    view.advancedSetting.navsorts,
    view.advancedSetting.customitems,
    view.advancedSetting.viewtitle,
    JSON.stringify(view.advancedSetting.groupsetting),
  ]);

  return isFirstGroupValidField && hasSecondGroup ? (
    <GroupBoard
      {...props}
      controlId={controlId}
      control={control}
      viewCardUpdateMap={viewCardUpdateMap}
      updateBoardViewCard={updateBoardViewCard}
    />
  ) : (
    <CommonBoard
      {...props}
      isFirstGroupValidField={isFirstGroupValidField}
      viewCardUpdateMap={viewCardUpdateMap}
      updateBoardViewCard={updateBoardViewCard}
    />
  );
};

const ConnectedBoardView = connect(
  state =>
    _.pick(state.sheet, [
      'boardView',
      'worksheetInfo',
      'filters',
      'controls',
      'sheetSwitchPermit',
      'sheetButtons',
      'navGroupFilters',
      'fieldShowCount',
      'updateBoardViewSortedOptionKeys',
    ]),
  dispatch => bindActionCreators({ ...boardActions, ...baseAction }, dispatch),
)(BoardView);

export default function Wrap(props) {
  return (
    <DndProvider key="board" context={window} backend={HTML5Backend}>
      <ConnectedBoardView {...props} />
    </DndProvider>
  );
}
