import React, { Fragment } from 'react';
import { find, includes, isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import MobileCardCellControl from './MobileCardCellControl';

const SummaryWrap = styled.div`
  display: flex;
  min-width: 0;

  .summaryControlsCon {
    display: inline-flex;
    width: 100%;
    flex-wrap: wrap;
    align-items: center;
    line-height: 20px;
    overflow: visible !important;
    word-break: break-all;
    white-space: normal;
  }

  .splitLine {
    display: inline-block;
    width: 1px;
    height: 12px;
    background: var(--color-border-primary);
    margin: 0 5px;
    vertical-align: -1px;
  }
  .childTableSummaryCell {
    width: auto;
    max-width: none;

    .childTableCellValue,
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

    .mobileRelateRecordWrap {
      background: transparent !important;
      padding: 0 !important;
    }
    .relateMultiple,
    .cellUsers,
    .cellDepartments,
    .cellOptions {
      display: inline-flex !important;
      max-height: none;
      overflow: visible;
      vertical-align: middle;
    }
    .cellOption {
      margin: 0 !important;
      line-height: inherit !important;
    }
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
          return (
            <Fragment key={control.controlId}>
              <MobileCardCellControl
                cellCellWrapClassName="childTableSummaryCell"
                control={control}
                row={row}
                showControlName={false}
                worksheetId={worksheetId}
                projectId={projectId}
                viewId={viewId}
                sheetSwitchPermit={sheetSwitchPermit}
                appId={appId}
                canedit={control.canEdit}
                updateCell={control.updateCell ? data => control.updateCell({ ...data, row }) : undefined}
              />
              {index < summaryControls.length - 1 && <div className="splitLine" />}
            </Fragment>
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
