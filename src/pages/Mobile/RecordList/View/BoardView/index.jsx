import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { RecordInfoModal } from 'mobile/Record';
import * as actions from 'mobile/RecordList/redux/actions';
import { getTargetName } from 'worksheet/views/BoardView/util';
import { getViewSelectFields, hasSecondGroupControl } from 'worksheet/views/BoardView/util';
import ViewEmpty from 'worksheet/views/components/ViewEmpty';
import { browserIsMobile } from 'src/utils/common';
import { getAdvanceSetting } from 'src/utils/control';
import RegExpValidator from 'src/utils/expression';
import { handlePushState, handleReplaceState } from 'src/utils/project';
import ViewErrorPage from '../components/ViewErrorPage';
import CommonBoard from './CommonBoard';
import GroupBoard from './GroupBoard';

const Container = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  background-color: #f2f2f3;

  .mobileCommonBoardWrap {
    .scaleContainer {
      width: 100%;
      height: ${props => 100 / props.scale}%;
    }
  }

  .mobileGroupBoardWrap {
    .scaleContainer {
      width: ${props => 100 / props.scale}%;
      height: 100%;
    }
  }

  .scaleContent {
    transform: ${props => `scale(${props.scale})`};
    transform-origin: top left;
    transition: transform 0.3s ease;
  }

  .zoomBox {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 20px;
    bottom: 20px;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    font-size: 26px;
    color: var(--gray-9e);
    background-color: var(--color-third);
    box-shadow: rgba(0, 0, 0, 0.16) 0px 4px 12px;
  }
`;

const MobileBoardView = props => {
  const {
    viewId,
    view,
    initBoardViewData,
    controls,
    sheetRowLoading,
    previewRecordId,
    worksheetInfo = {},
    sheetSwitchPermit,
    base = {},
    boardView,
    updatePreviewRecordId,
    updateBoardViewRecord,
    updateMultiSelectBoard,
    delBoardViewRecord,
    isCharge,
  } = props;
  const { boardViewRecordCount = {} } = boardView;
  const { viewControl } = view;
  const firstGroupControl = _.find(controls, item => item.controlId === viewControl);

  const { groupsetting } = getAdvanceSetting(view);

  // 二级分组字段id
  const controlId = useMemo(() => {
    return (safeParse(groupsetting)[0] || {}).controlId;
  }, [JSON.stringify(view.advancedSetting.groupsetting)]);
  // 二级分组的字段
  const control = _.find(controls, item => item.controlId === controlId) || {};
  // 二级分组字段是否有效
  const isValidField = !!control && getViewSelectFields(controls, worksheetInfo, view).find(o => o.value === controlId);
  const hasSecondGroup = groupsetting && viewControl && isValidField && hasSecondGroupControl(groupsetting, controls);

  // 是否已缩小
  const [isZoomedOut, setIsZoomedOut] = useState(false);
  const [updateRowParam, setUpdateRowParam] = useState({});
  const [viewCardUpdateMap, setViewCardHeightMap] = useState({});

  const updateViewCard = (rowid, height) => {
    if (viewCardUpdateMap[rowid] === height) return;
    setViewCardHeightMap(prev => ({
      ...prev,
      [rowid]: height,
    }));
  };

  const handleZoom = e => {
    e.stopPropagation();
    setIsZoomedOut(!isZoomedOut);
  };

  const openRecord = (updateRowParam, item) => {
    const { clicktype, clickcid } = view.advancedSetting || {};
    // clicktype：点击操作 空或者0：打开记录 1：打开链接 2：无
    if (clicktype === '2') return;
    if (clicktype === '1') {
      let value = item[clickcid];
      if (RegExpValidator.isURL(value)) {
        window.open(value);
      }
      return;
    }

    if (window.isMingDaoApp && window.APP_OPEN_NEW_PAGE) {
      window.location.href = `/mobile/record/${base.appId}/${base.worksheetId}/${base.viewId || view.viewId}/${
        item.rowid
      }`;
      return;
    }
    if (browserIsMobile()) {
      handlePushState('page', 'recordDetail');
      updatePreviewRecordId(item.rowid);
    }
    setUpdateRowParam(updateRowParam);
  };

  const onQueryChange = () => {
    handleReplaceState('page', 'recordDetail', () => updatePreviewRecordId(''));
  };

  const findTargetKey = (str, obj) => {
    const result =
      _.chain(_.keys(obj))
        .filter(key => key !== '-1')
        .find(key => str.includes(key))
        .value() || '-1';

    return result;
  };

  const updateRow = (rowId, value) => {
    if (!updateRowParam.key) {
      return;
    }
    // 分组字段值
    const preControlValue = updateRowParam.preRow[viewControl] || '';
    const isChangeGroup = preControlValue.includes(updateRowParam.key);
    let param = {
      key: updateRowParam.key,
      rowId,
      item: {
        ...value,
        ..._.pick(updateRowParam.preRow, ['allowdelete', 'allowedit']),
      },
      info: { type: firstGroupControl.type, viewControl },
      isChangeGroup,
    };

    const currentValue = value[viewControl];

    if (isChangeGroup) {
      param.target = currentValue;
      param.targetKey = findTargetKey(currentValue, boardViewRecordCount);
      param.targetName = getTargetName(currentValue, firstGroupControl, { type: firstGroupControl.type });
    }

    // 多选作为看板更改多选字段 更新数据
    if (firstGroupControl.type === 10 && preControlValue !== currentValue) {
      updateMultiSelectBoard({
        ...param,
        prevValue: preControlValue,
        currentValue,
        selectControl: firstGroupControl,
      });
      return;
    }
    updateBoardViewRecord(param);
  };

  const deleteCallback = rowId => {
    delBoardViewRecord({ key: updateRowParam.key, rowId });
  };

  useEffect(() => {
    window.addEventListener('popstate', onQueryChange);
    initBoardViewData(hasSecondGroup);
    setViewCardHeightMap({});

    return () => {
      window.removeEventListener('popstate', onQueryChange);
    };
  }, [viewId]);

  if (sheetRowLoading) {
    return <LoadDiv />;
  }

  if (!firstGroupControl) return <ViewErrorPage icon={'kanban'} viewName={_l('看板视图')} color="#4CAF50" />;

  if (_.every(Object.values(boardViewRecordCount), val => !val)) {
    return <ViewEmpty />;
  }

  return (
    <Container scale={isZoomedOut ? 0.6 : 1}>
      {hasSecondGroup ? (
        <GroupBoard
          {...props}
          controlId={controlId}
          control={control}
          openRecord={openRecord}
          updateViewCard={updateViewCard}
        />
      ) : (
        <CommonBoard {...props} openRecord={openRecord} updateViewCard={updateViewCard} />
      )}
      <div className="zoomBox" onClick={handleZoom}>
        <Icon className={isZoomedOut ? 'icon-zoom_in2' : 'icon-zoom_out'} />
      </div>
      <RecordInfoModal
        className="full"
        visible={!!previewRecordId}
        enablePayment={worksheetInfo.enablePayment}
        appId={base.appId}
        worksheetId={base.worksheetId}
        viewId={base.viewId || view.viewId}
        rowId={previewRecordId}
        sheetSwitchPermit={sheetSwitchPermit}
        canLoadSwitchRecord={false}
        onClose={() => updatePreviewRecordId('')}
        updateRow={updateRow}
        deleteCallback={deleteCallback}
        isCharge={isCharge}
      />
    </Container>
  );
};

export default connect(
  state => ({
    ..._.pick(state.mobile, [
      'base',
      'worksheetInfo',
      'boardView',
      'sheetRowLoading',
      'previewRecordId',
      'currentSheetRows',
      'isCharge',
    ]),
  }),
  dispatch =>
    bindActionCreators(
      {
        ..._.pick(actions, [
          'initBoardViewData',
          'getSingleBoardGroup',
          'updatePreviewRecordId',
          'updateBoardViewRecord',
          'updateMultiSelectBoard',
          'delBoardViewRecord',
          'addBoardViewRecord',
          'loadBoardViewNextGroup',
        ]),
      },
      dispatch,
    ),
)(MobileBoardView);
