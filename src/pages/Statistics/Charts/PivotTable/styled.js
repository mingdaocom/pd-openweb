import styled from 'styled-components';

const PivotTableContent = styled.div`
  &.contentYAuto {
    overflow-y: auto;
  }
  &.contentAutoHeight {
    overflow: hidden;
    .ant-table-wrapper,
    .ant-spin-nested-loading,
    .ant-spin-container,
    .ant-table,
    .ant-table-container,
    .ant-table-content {
      height: 100%;
    }
    .ant-table-content {
      overflow: auto !important;
    }
    .ant-table {
      height: ${props => props.paginationVisible ? 'calc(100% - 45px)' : '100%'};
    }
  }
  &.contentXAuto {
    .ant-table-container {
      width: fit-content;
      min-width: 100%;
    }
  }
  &.hideHeaderLastTr {
    thead tr:last-child {
      display: none;
    }
  }
  &.hideBody {
    .ant-table-tbody {
      display: none;
    }
  }
  &.hideDrag {
    .drag {
      display: none;
    }
  }
  &.contentScroll {
    .ant-table-header colgroup col:last-child {
      display: none;
    }
    thead th {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  &.safariScroll {
    .ant-table-header table {
      padding-right: 10px;
      border-top: none !important;
    }
    thead tr:first-child th {
      border-top: 1px solid #f0f0f0;
    }
  }
  &.cell-left .cell-content {
    text-align: left;
  }
  &.cell-center .cell-content {
    text-align: center;
  }
  &.cell-right .cell-content {
    text-align: right;
  }
  .cell-content {
    color: ${props => props.pivotTableStyle.textColor};
    text-align: ${props => props.pivotTableStyle.cellTextAlign || 'right'};
  }
  tbody {
    .cell-content {
      padding: 0 !important;
      position: relative;
    }
    .cell-value {
      padding: 8px;
      // height: 38px;
      position: relative;
      overflow-wrap: break-word;
      z-index: 2;
    }
    .data-bar, .data-bg {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
    }
    .data-bg {
      z-index: 0;
    }
    .data-bar, .data-axis {
      z-index: 1;
    }
    .data-axis {
      position: absolute;
      top: 0;
      height: 100%;
      border-left: 1px dashed #333;
    }
    .ant-table-cell-fix-left {
      z-index: 3;
    }
  }
  .line-content {
    text-align: ${props => props.pivotTableStyle.lineTextAlign || 'left'};
    color: ${props => props.pivotTableStyle.lineTextColor || '#000000d9'};
    background-color: ${props => props.pivotTableStyle.lineBgColor || '#fff'} !important;
  }
  .line-content, .cell-content {
    white-space: pre-wrap;
  }
  .ant-table-container {
    th.ant-table-cell-ellipsis {
      white-space: initial;
      overflow: initial;
    }
    thead th {
      text-align: ${props => props.pivotTableStyle.columnTextAlign || 'left'} !important;
      color: ${props => props.pivotTableStyle.columnTextColor || '#757575'};
      background-color: ${props => props.pivotTableStyle.columnBgColor || '#fafafa'} !important;
      font-weight: bold;
    }
  }
  .ant-pagination-options {
    display: block !important;
  }
  .ant-table-pagination.ant-pagination {
    margin-bottom: 5px;
    .ant-select-selector {
      border-radius: 4px;
    }
  }
  .ant-table-container, table, tr>th, tr>td {
    border-color: #E0E0E0 !important;
  }
  .ant-table-tbody > tr.ant-table-row:hover > td {
    background: initial;
  }
  .ant-table-tbody > tr.ant-table-row:nth-child(${props => props.isFreeze ? 'odd' : 'even'}) {
    background-color: ${props => props.pivotTableStyle.evenBgColor || '#fafcfd'};
    &:hover {
      background-color: ${props => props.pivotTableStyle.evenBgColor ? `${props.pivotTableStyle.evenBgColor}e8` : '#fafafa'};
    }
  }
  .ant-table-tbody > tr.ant-table-row:nth-child(${props => props.isFreeze ? 'even' : 'odd'}) {
    background-color: ${props => props.pivotTableStyle.oddBgColor || 'transparent'};
    &:hover {
      background-color: ${props => props.pivotTableStyle.oddBgColor ? `${props.pivotTableStyle.oddBgColor}e8` : '#fafafa'};
    }
  }
  .ant-table-tbody tr:not(tr.sum-content) .contentValue {
    cursor: pointer;
    &:hover {
      color: ${props => props.pivotTableStyle.lineTextColor || '#2196f3'} !important;
      background-color: ${props => props.pivotTableStyle.lineBgColor || '#E3F2FD'} !important;
    }
  }
  .ant-table-tbody .sum-content .ant-table-cell {
    font-weight: bold;
  }
  .drag {
    position: absolute;
    right: -1px;
    top: 0;
    z-index: 1;
    height: 100%;
    width: 2px;
    cursor: ew-resize;
    // background-color: red;
  }
  .dragLine {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 2;
    height: 100%;
    width: 2px;
    cursor: ew-resize;
    background-color: #0f8df2;
  }
  thead {
    th, td {
      text-align: left !important;
    }
  }
  th, td {
    min-width: ${props => props.isMobile ? '60px' : '100px'};
  }
  .ant-table-cell-scrollbar {
    display: none;
  }
  .ant-table-body {
    overflow-y: overlay !important;
    overflow-x: overlay !important;
  }
  .relevanceContent {
    width: 130px;
    display: flex;
    align-items: center;
    padding-right: 10px;
    word-break: break-word;
  }
  .otherContent {
    width: 130px;
  }
  .fileContent {
    min-width: 130px;
    flex-wrap: wrap;
    flex: none;
    overflow: hidden;
  }
  .imageWrapper {
    margin: 0 5px 5px 0;
    .fileIcon {
      display: flex;
    }
  }
`;

export default PivotTableContent;
