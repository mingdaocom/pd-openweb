import React, { Fragment } from 'react';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import { FixedTable } from 'ming-ui';
import cx from 'classnames';
import styled from 'styled-components';
import autoSize from 'ming-ui/decorators/autoSize';
import Trigger from 'rc-trigger';
import _ from 'lodash';
import { getIconByType } from 'src/pages/widgetConfig/util';
import SelectControls from 'worksheet/common/WorkSheetFilter/components/SelectControls';

const StyledFixedTable = styled(FixedTable)`
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  overflow: hidden;
  .cell {
    line-height: 20px;
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.09) !important;
    border-left: none !important;
    border-top: none !important;
    padding: 7px 8px;
    overflow: hidden;
    &.oddRow {
      background-color: #fafafa;
    }
  }
  .controlHead {
    display: flex;
    background: #fafafa;
    align-items: center;
    .controlIcon {
      margin-right: 4px;
      font-size: 15px;
      color: #9d9d9d;
    }
    .dropdownIcon {
      margin-left: 4px;
      font-size: 13px;
      color: #9d9d9d;
    }
    .controlName {
      color: #333;
      font-size: 13px;
      font-weight: 500;
    }
  }
`;

const SelectControlsWrap = styled(SelectControls)`
  .worksheetFilterColumnOptionList.menuList {
    width: 310px !important;
    max-height: 240px;
  }
`;

const NoImportItem = styled.div`
  cursor: pointer;
  height: 48px;
  padding: 0 15px;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  .icon {
    margin-right: 3px;
  }
`;

function renderNormalHead(props) {
  const { controls, key, style, columnIndex } = props;
  const control = controls[columnIndex];
  return (
    <div key={key} style={style} className={'cell controlHead'}>
      {!!control && (
        <Fragment>
          <i className={`controlIcon icon-${getIconByType(control.type)}`}></i>
          <div className="flex controlName">
            <div className="ellipsis">{control.controlName}</div>
          </div>
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

function PreviewTable(props) {
  const {
    loading,
    mode = 'paste',
    height = 400,
    rowCount = 11,
    showNumber = false,
    disableYScroll,
    width,
    controls,
    mapConfig = {},
    renderCellContent,
    onUpdateMapConfig = () => {},
  } = props;
  let columnCount = mode === 'paste' ? controls.length : Object.keys(mapConfig).length;
  if (showNumber) {
    columnCount = columnCount + 1;
  }
  return (
    <StyledFixedTable
      loading={loading}
      disableYScroll={disableYScroll}
      width={width}
      height={height}
      rowHeight={34}
      getColumnWidth={columnIndex => (showNumber && columnIndex === 0 ? 60 : 150)}
      rowCount={rowCount > 11 ? rowCount : 11}
      columnCount={columnCount}
      leftFixedCount={showNumber ? 1 : 0}
      renderHeadCell={({ style, key, columnIndex }) => {
        if (showNumber && columnIndex === 0) {
          return <div key={key} style={style} className="cell controlHead " />;
        }
        if (showNumber) {
          columnIndex = columnIndex - 1;
        }
        if (mode === 'paste') {
          return renderNormalHead({
            controls,
            style,
            key,
            columnIndex,
          });
        }
        const controlId = mapConfig[columnIndex];
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
                      onUpdateMapConfig(columnIndex, undefined);
                    }}
                  >
                    <i className="icon icon-file_upload_off Font15 Gray_bd"></i>
                    {_l('不导入此列')}
                  </NoImportItem>
                }
                onAdd={newControl => {
                  onUpdateMapConfig(columnIndex, newControl.controlId);
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
                className={`controlIcon icon-${control ? getIconByType(control.type) : 'file_upload_off Gray_bd'}`}
              ></i>
              <div className="flex controlName">
                {control ? (
                  <div className="ellipsis">{control.controlName}</div>
                ) : (
                  <div className="ellipsis Gray_c6">{_l('不导入此列')}</div>
                )}
              </div>
              <i className="dropdownIcon icon icon-arrow-down"></i>
            </div>
          </Trigger>
        );
      }}
      renderCell={({ style, key, rowIndex, columnIndex }) => (
        <div
          key={key}
          style={Object.assign(
            style,
            mode === 'paste' && rowIndex === 0 && columnIndex === 0
              ? { boxShadow: 'inset 0px 0px 0px 1px #2196f3' }
              : {},
          )}
          className={cx('cell', { oddRow: rowIndex % 2 === 1, TxtCenter: showNumber && columnIndex === 0 })}
        >
          {(() => {
            if (showNumber && columnIndex === 0 && rowIndex < rowCount) {
              return rowIndex + 1;
            } else if (_.isFunction(renderCellContent)) {
              return renderCellContent({ rowIndex, columnIndex: showNumber ? columnIndex - 1 : columnIndex });
            } else {
              return;
            }
          })()}
        </div>
      )}
    />
  );
}

PreviewTable.propTypes = {
  mode: string,
  height: number,
  rowCount: number,
  showNumber: bool,
  disableYScroll: bool,
  width: number,
  controls: arrayOf(shape({})),
  mapConfig: arrayOf(shape({})),
  renderCellContent: func,
  onUpdateMapConfig: func,
};

export default autoSize(PreviewTable);
