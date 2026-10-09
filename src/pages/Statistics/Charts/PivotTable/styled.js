import styled from 'styled-components';

const PivotTableContent = styled.div`
  .hap-table {
    color: var(--color-text-primary);
    background: var(--color-background-primary);
  }
  &.contentYAuto {
    overflow-y: auto;
  }
  &.contentAutoHeight {
    overflow: hidden;
    .hap-table-wrapper,
    .hap-spin,
    .hap-spin-nested-loading,
    .hap-spin-container,
    .hap-table,
    .hap-table-container,
    .hap-table-content {
      height: 100%;
    }
    .hap-table-content {
      overflow: auto !important;
    }
    .hap-table {
      height: ${props => (props.$paginationVisible ? 'calc(100% - 45px)' : '100%')};
    }
  }
  &.contentXAuto {
    .hap-table-container {
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
    .hap-table-tbody {
      display: none;
    }
  }
  &.hideDrag {
    .drag {
      display: none;
    }
  }
  &.contentScroll {
    thead th {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  &.safariScroll {
    .hap-table-header table {
      border-top: none !important;
    }
    thead tr:first-child th {
      border-top: 1px solid var(--color-background-disabled);
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
  .hap-table {
    line-height: 1.36;
  }
  .cell-content {
    color: ${props => props.$pivotTableStyle.textColor};
    text-align: ${props => props.$pivotTableStyle.cellTextAlign || 'right'};
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
    .cell-content[style*='--pivot-table-cell-bg']::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--pivot-table-cell-bg);
      z-index: 0;
    }
    .data-bar {
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      box-sizing: border-box;
    }
    .hap-table-cell-fix-left {
      z-index: 3;
    }
  }
  .line-content {
    text-align: ${props => props.$pivotTableStyle.lineTextAlign || 'left'};
    color: ${props => props.$pivotTableStyle.lineTextColor || 'var(--color-text-primary)'};
    background-color: ${props => props.$pivotTableStyle.lineBgColor || 'var(--color-background-primary)'} !important;
    .departmentWrap {
      padding: 0 5px;
      border-radius: 13px;
      width: max-content;
      background-color: rgba(80, 120, 150, 0.08);
    }
    .userWrap {
      .userHead {
        width: 30px;
      }
    }
    .optionWrap {
      color: var(--color-black);
      padding: 3px 8px;
      border-radius: 40px;
      width: max-content;
    }
  }
  .line-content:not(.hap-table-cell-ellipsis),
  .cell-content {
    white-space: pre-wrap;
  }
  .hap-table-container {
    th.hap-table-cell-ellipsis {
      white-space: initial;
      overflow: initial;
    }
    thead th {
      text-align: ${props => props.$pivotTableStyle.columnTextAlign || 'left'} !important;
      color: ${props => props.$pivotTableStyle.columnTextColor || 'var(--color-text-secondary)'};
      background-color: ${props =>
        props.$pivotTableStyle.columnBgColor || 'var(--color-background-secondary)'} !important;
      font-weight: bold;
    }
  }
  .hap-pagination,
  .hap-pagination-item:not(.hap-pagination-item-active) a,
  .hap-pagination-prev button,
  .hap-pagination-next button {
    color: var(--title-color);
  }
  .hap-pagination-options {
    display: block !important;
  }
  .hap-table-pagination.hap-pagination {
    margin-bottom: 5px;
  }
  .hap-table-container,
  table,
  tr > th,
  tr > td {
    border-color: var(--color-border-secondary) !important;
  }
  .hap-table-tbody > tr.hap-table-row:hover > td {
    background: initial;
  }
  .hap-table-tbody > tr > td.cell-content {
    /* 取消单元格背景过渡，避免快速 hover 时留下渐变色块。 */
    transition-property: border-color;
  }
  .hap-table-tbody > tr.hap-table-row:nth-child(${props => (props.$isFreeze ? 'odd' : 'even')}) {
    .cell-content {
      color: ${props => props.$pivotTableStyle.evenTextColor} !important;
      background-color: transparent !important;
    }
    background-color: ${props => props.$pivotTableStyle.evenBgColor || 'var(--color-background-secondary)'};
    &:hover {
      background-color: ${props =>
        props.$pivotTableStyle.evenBgColor
          ? `${props.$pivotTableStyle.evenBgColor}e8`
          : 'var(--color-background-secondary)'};
    }
  }
  .hap-table-tbody > tr.hap-table-row:nth-child(${props => (props.$isFreeze ? 'even' : 'odd')}) {
    .cell-content {
      color: ${props => props.$pivotTableStyle.oddTextColor} !important;
      background-color: transparent !important;
    }
    background-color: ${props => props.$pivotTableStyle.oddBgColor || 'transparent'};
    &:hover {
      background-color: ${props =>
        props.$pivotTableStyle.oddBgColor
          ? `${props.$pivotTableStyle.oddBgColor}e8`
          : 'var(--color-background-secondary)'};
    }
  }
  .hap-table-tbody tr:not(tr.sum-content) .contentValue {
    cursor: pointer;
    &:hover {
      color: ${props => props.$pivotTableStyle.lineTextColor || 'var(--color-primary)'} !important;
      background-color: ${props => props.$pivotTableStyle.lineBgColor || 'var(--color-primary-transparent)'} !important;
    }
  }
  .hap-table-tbody .sum-content .hap-table-cell {
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
    // background-color: var(--color-error);
  }
  .pivotTableDragLine {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 3;
    height: 100%;
    width: 2px;
    cursor: ew-resize;
    background-color: var(--color-primary);
  }
  thead {
    th,
    td {
      text-align: left !important;
    }
  }
  th,
  td {
    min-width: ${props => (props.$isMobile ? '60px' : '100px')};
  }
  // 固定表头时保留 Ant Design 的滚动条占位列，避免 Windows 滚动条压缩表体后列错位
  .hap-table-cell-scrollbar {
    min-width: 0;
  }
  .hap-table-body {
    > table {
      transform: translateZ(0);
    }
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
