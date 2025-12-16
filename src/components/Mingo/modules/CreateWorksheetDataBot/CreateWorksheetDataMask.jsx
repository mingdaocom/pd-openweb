import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cx from 'classnames';
import { flatten, isEmpty, noop } from 'lodash';
import styled from 'styled-components';
import { BgIconButton, Button } from 'ming-ui';
import BaseColumnHead from 'worksheet/components/BaseColumnHead';
import WorksheetTable from 'worksheet/components/WorksheetTable';
import { putControlByOrder } from 'src/pages/widgetConfig/util';
import LoadingDots from 'src/pages/widgetConfig/widgetSetting/components/DevelopWithAI/ChatBot/LoadingDots';

const SideMaskWrap = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  z-index: 21;
  padding: 16px 18px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  .title {
    font-size: 18px;
    font-weight: bold;
    color: #151515;
    margin-bottom: 20px;
  }
  .rowHeadNumber {
    font-size: 13px;
    color: #9e9e9e;
    text-align: center;
  }
  .append-button {
    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
  &:not(.disabled).clean-button {
    &:hover {
      background: #fff;
    }
  }
`;

export default function CreateWorksheetDataMask({
  isLoading,
  appId,
  projectId,
  controls,
  data,
  onAppendToWorksheet = () => {},
  onClean = () => {},
}) {
  const tableRef = useRef(null);
  const cache = useRef({
    prevData: [],
  });
  const [isAppending, setIsAppending] = useState(false);
  const [tableColumnWidths, setTableColumnWidth] = useState({});
  const disabled = isLoading || isAppending || data.length === 0;
  const columns = flatten(putControlByOrder(controls));
  useEffect(() => {
    if (isEmpty(cache.current.prevData) && !isEmpty(data)) {
      try {
        tableRef.current.table.refs.setScroll({ top: 0, left: 0 });
      } catch (error) {
        console.error(error);
      }
    }
    cache.current.prevData = data;
  }, [data]);
  return createPortal(
    <SideMaskWrap>
      <div className="title t-flex t-items-center t-justify-between">
        {_l('预览')}

        <div className="t-flex t-items-center">
          <BgIconButton
            className="mRight20 clean-button"
            tooltip={_l('清空')}
            disabled={isLoading}
            icon="clean"
            onClick={isLoading ? noop : onClean}
          />
          <Button
            type="primary"
            className={cx('append-button', { disabled })}
            onClick={() => {
              if (disabled) return;
              setIsAppending(true);
              onAppendToWorksheet();
            }}
          >
            {isAppending ? _l('添加中...') : _l('添加到工作表')}
          </Button>
        </div>
      </div>
      <div className="t-flex-1">
        <WorksheetTable
          ref={tableRef}
          showEmptyForResize={false}
          appId={appId}
          // loading={loading}
          // viewId={viewId}
          projectId={projectId}
          // noRenderEmpty={!searchText}
          columns={columns}
          rowHeight={34}
          // selectedIds={selected}
          data={data}
          sheetColumnWidths={tableColumnWidths}
          renderColumnHead={({ className, style, columnIndex }) => {
            return (
              <BaseColumnHead
                className={className}
                style={style}
                control={columns[columnIndex - 1] || {}}
                isLast={columnIndex === columns.length - 1}
                updateSheetColumnWidths={({ controlId, value }) => {
                  setTableColumnWidth(prev => ({ ...prev, [controlId]: value }));
                }}
              />
            );
          }}
          renderRowHead={({ className, style, rowIndex }) => {
            const isLast = rowIndex === data.length - 1;
            if (isLoading && isLast && rowIndex >= 0) {
              return (
                <div className={cx(className, 'rowHeadNumber t-flex t-items-center t-justify-center')} style={style}>
                  <LoadingDots dotNumber={3} />
                </div>
              );
            }
            return (
              <div className={cx(className, 'rowHeadNumber')} style={style}>
                {rowIndex >= 0 ? rowIndex + 1 : ''}
              </div>
            );
          }}
        />
      </div>
    </SideMaskWrap>,
    document.querySelector('#containerWrapper'),
  );
}
