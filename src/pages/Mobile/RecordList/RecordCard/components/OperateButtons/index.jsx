import React, { memo, useContext, useState } from 'react';
import styled from 'styled-components';
import MobileSheetContext from 'mobile/RecordList/MobileSheetContext';
import { getCoverStyle } from 'src/pages/worksheet/common/ViewConfig/utils';
import { getTitleTextFromControls } from 'src/utils/control';
import {
  filterButtonBySheetSwitchPermit,
  getSheetOperatesButtons,
  getSheetOperatesButtonsStyle,
} from 'src/utils/worksheet';
import CustomButtons from '../CustomButtons';
import MoreButtonPopup from '../MoreButtonPopup';
import { filterButtonByNotSupport, getRowDetail, getVisibleButtons, setAttrToButtons } from './util';

const OperateButtonsWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${props => (props.showType === 'icon' ? '0 0 10px' : '0 12px 10px')};
  ${({ coverCid, coverPosition, coverFillType }) =>
    coverCid && (coverPosition === '1' || coverPosition === '0') && coverFillType === 0 && `padding-top: 10px};`}
  ${props => props.colorType !== '0' && 'padding-top: 10px;'}
  ${props => props.showType === 'standard' && 'gap: 5px;'}
`;

const OperateButtons = props => {
  const { row = {}, onDeleteSuccess, updateRow } = props;
  const context = useContext(MobileSheetContext);
  const { base, view = {}, sheetButtons, printList, sheetSwitchPermit, controls, worksheetInfo } = context || {};
  const { viewId, viewType, advancedSetting = {}, coverCid } = view;
  const { coverFillType, coverPosition } = getCoverStyle(view);
  const isGroupView = viewType === 1 || advancedSetting.groupsetting;
  const [btnDisable, setBtnDisable] = useState({});
  let buttons = getSheetOperatesButtons(view, {
    buttons: sheetButtons,
    printList,
  });
  buttons = filterButtonBySheetSwitchPermit(buttons, sheetSwitchPermit, viewId, row);
  buttons = filterButtonByNotSupport(buttons);
  const operatesButtonsStyle = getSheetOperatesButtonsStyle(view);
  const { visibleNum, style } = operatesButtonsStyle;
  const disableCustomButton = btnId => {
    setBtnDisable(old => ({ ...old, [btnId]: true }));
  };
  buttons = setAttrToButtons({
    buttons,
    row,
    operatesButtonsStyle,
    context,
    onDeleteSuccess,
    disableCustomButton,
  });
  const showMore = visibleNum < buttons.length;
  // 没有按钮，不显示
  if (!buttons.length) return null;

  const visibleButtons = getVisibleButtons(buttons, visibleNum);
  const morePopupTitle = getTitleTextFromControls(controls, row);

  const handleUpdateRecord = async () => {
    // 看板视图、表格或画廊有分组时不执行更新
    if (isGroupView) return;
    try {
      const recordId = row.rowid;
      const res = await getRowDetail({
        recordId,
        viewId,
        worksheetId: worksheetInfo.worksheetId,
      });
      const rowData = JSON.parse(res.rowData);
      updateRow({ recordId, rowData, isViewData: res.isViewData });
    } catch (error) {
      console.log('error', error);
    }
  };

  return (
    <OperateButtonsWrapper
      showType={style}
      viewType={view.viewType}
      coverCid={coverCid}
      coverPosition={coverPosition}
      coverFillType={coverFillType}
      colorType={advancedSetting.colortype}
    >
      <CustomButtons
        isInCard
        showMore={showMore}
        buttons={visibleButtons}
        showType={style}
        row={row}
        view={view}
        {...base}
        btnDisable={btnDisable}
        worksheetInfo={worksheetInfo}
        onButtonClick={disableCustomButton}
        updateRecord={handleUpdateRecord}
      />
      <MoreButtonPopup title={morePopupTitle} showMore={showMore} showType={style} row={row}>
        <CustomButtons
          showMore={showMore}
          buttons={buttons}
          showType={style}
          row={row}
          view={view}
          {...base}
          btnDisable={btnDisable}
          worksheetInfo={worksheetInfo}
          onButtonClick={disableCustomButton}
          updateRecord={handleUpdateRecord}
        />
      </MoreButtonPopup>
    </OperateButtonsWrapper>
  );
};

export default memo(OperateButtons);
