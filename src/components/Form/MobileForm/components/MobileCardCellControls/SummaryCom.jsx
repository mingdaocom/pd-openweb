import React from 'react';
import { find, includes, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { renderText } from 'src/utils/domain/control/display';
import { checkControlCanSetStyle } from 'src/utils/domain/control/type';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/utils/domain/control/widgetTypes';
import MobileCardCellControl, { getCardCellControl, shouldShowCardMultipleValue } from './MobileCardCellControl';

const SUMMARY_EXTRA_TEXT_CONTROL_TYPES = [WIDGETS_TO_API_TYPE_ENUM.SCORE];

function getSummaryDisplayType(control) {
  if (control.type === 30) return control.sourceControlType;
  if (control.type === 37) return control.enumDefault2 || 6;
  if (control.type === 53) return control.enumDefault2 || control.type;

  return control.type;
}

// 最终以普通文字展示的控件在折叠摘要中单行省略，后续摘要继续按行内排列。
function isSummaryTextControl(control) {
  const type = getSummaryDisplayType(control);
  return checkControlCanSetStyle(type) || includes(SUMMARY_EXTRA_TEXT_CONTROL_TYPES, type);
}

const SummaryWrap = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;

  .summaryControlsCon {
    display: block;
    width: 100%;
    line-height: 20px;
    overflow: visible !important;
    word-break: break-all;
    white-space: normal;
  }

  .summaryControlGroup {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    max-width: 100%;
    vertical-align: middle;
  }

  .splitLine {
    display: inline-block;
    flex: 0 0 1px;
    width: 1px;
    height: 12px;
    background: var(--color-border-primary);
    margin: 0 5px;
    vertical-align: middle;
  }
  .childTableSummaryCell {
    display: inline-flex !important;
    align-items: center;
    vertical-align: middle;
    -webkit-flex: 0 1 auto !important;
    flex: 0 1 auto !important;
    -ms-flex: 0 1 auto !important;
    width: auto !important;
    min-width: 0;
    max-width: none;
    margin-top: 0 !important;
    margin-bottom: 0 !important;

    &.summaryTextCell {
      display: inline-block !important;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--color-text-primary);
      font-size: 14px;
      font-weight: 400;
      line-height: 20px !important;
      vertical-align: middle;
    }

    .cell,
    .cell .ellipsis,
    .editableCellCon,
    .mobileRelateRecordWrap,
    .worksheetCellPureString {
      display: inline !important;
      max-width: none;
      max-height: none;
      overflow: visible;
      text-overflow: clip;
      white-space: normal;
      -webkit-line-clamp: unset;
      -webkit-box-orient: unset;
    }

    .cell {
      display: inline-flex !important;
      -webkit-flex: 0 1 auto !important;
      flex: 0 1 auto !important;
      -ms-flex: 0 1 auto !important;
      align-items: center;
      min-width: 0;
      max-width: 100%;
      width: auto !important;
      vertical-align: middle;
    }

    .childTableCellValue {
      display: inline-flex !important;
      align-items: center;
      -webkit-flex: 0 1 auto !important;
      flex: 0 1 auto !important;
      -ms-flex: 0 1 auto !important;
      min-width: 0;
      max-width: 100%;
      width: auto !important;
      line-height: 20px !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
      vertical-align: middle;
    }

    .w100:not(.h100) {
      width: auto !important;
    }

    &:has(.cellOptions),
    .childTableCellValue:has(.cellOptions) {
      max-width: 100%;
    }

    .mobileRelateRecordWrap {
      background: transparent !important;
      padding: 0 !important;
      font-size: 14px;
    }
    .relateMultiple,
    .cellUsers,
    .cellDepartments,
    .cellOptions {
      display: inline-flex !important;
      max-height: none;
      vertical-align: middle;
    }
    .cellUsers,
    .cellDepartments {
      flex-wrap: wrap;
      max-width: 100%;
      min-width: 0;
      overflow: hidden;
      padding: 2px 0;
      column-gap: 4px;
      row-gap: 4px;
    }
    .cellUsers .cellUser,
    .cellDepartments .cellDepartment {
      margin: 0 !important;
    }
    .cellOptions {
      flex-wrap: nowrap;
      justify-content: flex-start;
      width: auto !important;
      max-width: 100%;
      min-width: 0;
      overflow: hidden !important;
      padding: 2px 0;
      white-space: nowrap;
      column-gap: 4px;
      row-gap: 4px;
    }
    .cellOptions .cellOption {
      display: inline-block !important;
      flex: 0 0 auto;
      min-width: 0;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      margin: 0 !important;
      line-height: inherit !important;
      white-space: nowrap;
    }
  }
  .summaryTextNull {
    display: inline-block;
    width: 22px;
    height: 6px;
    border-radius: 3px;
    background: var(--color-border-primary);
    vertical-align: middle;
  }
`;

// 摘要组件
export default function SummaryCom(props) {
  const {
    projectId,
    appId,
    worksheetId,
    viewId,
    sheetSwitchPermit,
    controls,
    showControls,
    h5AbstractIds,
    row,
    className,
    handleClick = () => {},
  } = props;

  const showFields = controls.filter(c => find(showControls || [], scid => scid === c.controlId));
  const summaryControls =
    isEmpty(h5AbstractIds) || isEmpty(showFields.filter(v => includes(h5AbstractIds, v.controlId)))
      ? showFields.slice(0, 3)
      : showFields
          .filter(v => includes(h5AbstractIds, v.controlId))
          .sort((a, b) => h5AbstractIds.indexOf(a.controlId) - h5AbstractIds.indexOf(b.controlId))
          .slice(0, 3);
  if (isEmpty(summaryControls)) return null;

  return (
    <SummaryWrap className={className} onClick={handleClick}>
      {/* 摘要 */}
      <div className="summaryControlsCon">
        {summaryControls.map((control, index) => {
          const isTextControl = isSummaryTextControl(control);
          const textValue = isTextControl
            ? renderText({ ...control, value: row[control.controlId] }, { appId })
            : undefined;

          return (
            <div className="summaryControlGroup" key={control.controlId}>
              {isTextControl ? (
                <span className="childTableSummaryCell childTableCellValue summaryTextCell">
                  {textValue === '' ? <span className="summaryTextNull" /> : textValue}
                </span>
              ) : (
                <MobileCardCellControl
                  cellCellWrapClassName="childTableSummaryCell"
                  control={getCardCellControl(control)}
                  row={row}
                  showControlName={false}
                  worksheetId={worksheetId}
                  projectId={projectId}
                  viewId={viewId}
                  sheetSwitchPermit={sheetSwitchPermit}
                  appId={appId}
                  showMultipleValue={shouldShowCardMultipleValue(control)}
                  canedit={control.canEdit}
                  updateCell={control.updateCell ? data => control.updateCell({ ...data, row }) : undefined}
                />
              )}
              {index < summaryControls.length - 1 && <div className="splitLine" />}
            </div>
          );
        })}
      </div>
    </SummaryWrap>
  );
}

SummaryCom.propTypes = {
  controls: PropTypes.array,
  showControls: PropTypes.array,
  h5AbstractIds: PropTypes.array,
  row: PropTypes.object.isRequired,
  className: PropTypes.string,
  handleClick: PropTypes.func,
};
