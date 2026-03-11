import React, { Fragment, useEffect, useRef } from 'react';
import cx from 'classnames';
import _, { includes } from 'lodash';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { FixedTable } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import autoSize from 'ming-ui/decorators/autoSize';
import SelectControls from 'worksheet/common/WorkSheetFilter/components/SelectControls';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { getIndex } from '../WorksheetTable/components/Cell';

const StyledFixedTable = styled(FixedTable)`
  border-radius: 4px;
  border: 1px solid var(--color-border-secondary);
  overflow: hidden;
  .cell {
    line-height: 20px;
    background-color: var(--color-background-primary);
    border: 1px solid rgba(0, 0, 0, 0.09) !important;
    border-left: none !important;
    border-top: none !important;
    padding: 7px 8px;
    overflow: hidden;
    background-color: var(--color-cyan-blue);
    &.oddRow {
      background-color: var(--color-background-primary);
    }
  }
  .controlHead {
    display: flex;
    background-color: var(--color-background-primary);
    align-items: center;
    .controlIcon {
      margin-right: 4px;
      font-size: 15px;
      color: var(--color-text-tertiary);
    }
    .dropdownIcon {
      margin-left: 4px;
      font-size: 13px;
      color: var(--color-text-tertiary);
    }
    .controlName {
      color: var(--color-text-title);
      font-size: 13px;
      font-weight: 500;
    }
  }
`;

const SelectControlsWrap = styled(SelectControls)`
  .worksheetFilterColumnOptionList.menuList {
    width: 310px !important;
    max-height: 240px;
    .Item-content {
      padding: 0 16px;
    }
  }
`;

const NoImportItem = styled.div`
  cursor: pointer;
  height: 48px;
  padding: 0 15px;
  border: 1px solid var(--color-border-secondary);
  display: flex;
  align-items: center;
  .icon {
    margin-right: 3px;
  }
`;

function checkCellFullVisible(element) {
  const left = element.offsetLeft;
  const top = element.offsetTop;
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  let newLeft;
  let newTop;
  const scrollLeft = element.parentElement.parentElement.scrollLeft;
  const scrollTop = element.parentElement.parentElement.scrollTop;
  const gridWidth = element.parentElement.parentElement.clientWidth;
  const gridHeight = element.parentElement.parentElement.clientHeight;
  const rightVisible = left + width <= scrollLeft + gridWidth;
  const leftVisible = left >= scrollLeft;
  const topVisible = top >= scrollTop;
  const bottomVisible = top + height <= scrollTop + gridHeight;
  if (!leftVisible) {
    newLeft = left;
  }
  if (!rightVisible) {
    newLeft = left + width - gridWidth;
  }
  if (!topVisible) {
    newTop = top;
  }
  if (!bottomVisible) {
    newTop = top + height - gridHeight;
  }
  return {
    fullvisible: rightVisible && leftVisible && topVisible && bottomVisible,
    newLeft,
    newTop,
  };
}

function ControlTooltip(props) {
  const { control } = props;
  if (!includes([WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT, WIDGETS_TO_API_TYPE_ENUM.USER_PICKER], control.type)) {
    return null;
  }
  const tipText = {
    [WIDGETS_TO_API_TYPE_ENUM.DEPARTMENT]: _l('支持导入名称、部门系统ID'),
    [WIDGETS_TO_API_TYPE_ENUM.USER_PICKER]: _l(
      '支持导入姓名、手机号、邮箱、工号、人员ID。手机号前缀需要附带国家代码以及+号, 例如美国号码：+1**********',
    ),
  }[control.type];
  return (
    <Tooltip title={tipText}>
      <i className="icon icon-info_outline Font16 textTertiary mLeft8"></i>
    </Tooltip>
  );
}

function renderNormalHead(props) {
  const { controls, key, style, columnIndex } = props;
  const control = controls[columnIndex];
  return (
    <div key={key} style={style} className={'cell controlHead'}>
      {!!control && (
        <Fragment>
          <i className={`controlIcon icon-${getIconByType(control.type)}`}></i>
          <div className="flex controlName ellipsis">{control.controlName}</div>
          <ControlTooltip control={control} />
        </Fragment>
      )}
    </div>
  );
}

renderNormalHead.propTypes = {
  controls: arrayOf(shape({})),
  key: number,
  style: shape({}),
  columnIndex: number,
};

function getCellWidth(width, columnCount, showNumber) {
  const averageWidth = (showNumber ? width - 60 : width) / (columnCount - (showNumber ? 1 : 0));
  return averageWidth > 150 ? averageWidth : 150;
}

function PreviewTable(props) {
  const {
    loading,
    activeIndex,
    mode = 'paste',
    height = 400,
    rowCount = 14,
    showNumber = false,
    rowStartIndex,
    disableYScroll,
    width,
    controls,
    mapConfig = {},
    renderCellContent,
    onCellClick = () => {},
    onUpdateMapConfig = () => {},
  } = props;
  let columnCount = mode === 'paste' ? controls.length : Object.keys(mapConfig).length;
  if (props.columnCount && props.columnCount > columnCount) {
    columnCount = props.columnCount;
  }
  if (showNumber) {
    columnCount = columnCount + 1;
  }
  const tableRef = useRef();
  useEffect(() => {
    const tableDom = _.get(tableRef, 'current.dom.current');
    if (!tableDom) {
      return;
    }
    const activeCell = tableDom.querySelector('.cell.active');
    if (activeCell) {
      const result = checkCellFullVisible(activeCell);
      if (!result.fullvisible) {
        tableRef.current.setScroll(result.newLeft, result.newTop);
      }
    }
  });
  useEffect(() => {
    try {
      tableRef.current.forceUpdate();
    } catch (err) {
      console.log(err);
    }
  }, [columnCount]);
  const cellWidth = getCellWidth(width, columnCount, showNumber);
  const fullTableCount = Math.ceil(height / 34);
  return (
    <StyledFixedTable
      showHead
      ref={tableRef}
      loading={loading}
      disableYScroll={disableYScroll}
      width={width}
      height={height}
      rowHeight={34}
      getColumnWidth={columnIndex => (showNumber && columnIndex === 0 ? 60 : cellWidth)}
      rowCount={rowCount > fullTableCount ? rowCount : fullTableCount}
      columnCount={columnCount}
      leftFixedCount={showNumber ? 1 : 0}
      Cell={({ style, key, data = {}, ...rest }) => {
        const { columnIndex, rowIndex } = getIndex({
          columnIndex: rest.columnIndex,
          rowIndex: rest.rowIndex,
          ...(data.grid || {}),
        });
        const index = rowIndex * columnCount + columnIndex;
        if ((_.get(data, 'grid.id') || '').startsWith('top')) {
          if (showNumber && columnIndex === 0) {
            return typeof rowStartIndex === 'undefined' ? (
              <div key={key} style={style} className="cell controlHead " />
            ) : (
              <div key={key} style={style} className="cell TxtCenter ">
                {rowStartIndex !== 0 && rowStartIndex}
              </div>
            );
          }
          if (mode === 'paste') {
            return renderNormalHead({
              controls,
              style,
              key,
              columnIndex,
            });
          }
          const controlId = mapConfig[columnIndex - 1];
          const control = controlId && _.find(controls, { controlId });
          return (
            <Trigger
              action={['click']}
              popup={
                <SelectControlsWrap
                  className="lightTheme"
                  controls={controls}
                  filterColumnClassName={'menuList'}
                  selected={controlId}
                  footer={
                    <NoImportItem
                      onClick={() => {
                        onUpdateMapConfig(columnIndex - 1, undefined);
                      }}
                    >
                      <i className="icon icon-file_upload_off Font15 textDisabled"></i>
                      {_l('不导入此列')}
                    </NoImportItem>
                  }
                  onAdd={newControl => {
                    onUpdateMapConfig(columnIndex - 1, newControl.controlId);
                  }}
                />
              }
              getPopupContainer={() => document.body}
              popupAlign={{
                points: ['tr', 'br'],
                overflow: {
                  adjustX: true,
                  adjustY: true,
                },
              }}
            >
              <div key={key} style={style} className="cell controlHead Hand">
                <i
                  className={`controlIcon icon-${control ? getIconByType(control.type) : 'file_upload_off textDisabled'}`}
                ></i>
                <div className="flex controlName overflowHidden">
                  {control ? (
                    <div className="ellipsis overflowHidden" title={control.controlName}>
                      {control.controlName}
                    </div>
                  ) : (
                    <div className="ellipsis textPlaceholder">{_l('不导入此列')}</div>
                  )}
                </div>
                {!!control && <ControlTooltip control={control} />}
                <i className="dropdownIcon icon icon-arrow-down"></i>
              </div>
            </Trigger>
          );
        }
        return (
          <div
            key={key}
            style={Object.assign(
              {},
              style,
              index === activeIndex ? { boxShadow: 'inset 0px 0px 0px 1px var(--color-primary)' } : {},
            )}
            className={cx('cell', {
              active: index === activeIndex,
              oddRow: rowIndex % 2 === 1,
              TxtCenter: showNumber && columnIndex === 0,
            })}
            onClick={() => {
              onCellClick(index, { columnIndex, rowIndex });
            }}
          >
            {(() => {
              if (showNumber && columnIndex === 0 && rowIndex < rowCount) {
                return rowIndex + (rowStartIndex || 0) + 1;
              } else if (_.isFunction(renderCellContent)) {
                return renderCellContent({ index, rowIndex, columnIndex: showNumber ? columnIndex - 1 : columnIndex });
              } else {
                return;
              }
            })()}
          </div>
        );
      }}
    />
  );
}

PreviewTable.propTypes = {
  loading: bool,
  activeIndex: number,
  mode: string,
  height: number,
  rowCount: number,
  showNumber: bool,
  disableYScroll: bool,
  width: number,
  rowStartIndex: number,
  controls: arrayOf(shape({})),
  mapConfig: arrayOf(shape({})),
  renderCellContent: func,
  onUpdateMapConfig: func,
  onCellClick: func,
};

export default autoSize(PreviewTable);
