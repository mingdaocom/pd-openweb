import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv } from 'ming-ui';
import { Checkbox } from 'ming-ui/antd-components';
import QuotaCell from './QuotaCell';

/** 额度配置表格，负责表头排序、行选择和加载状态，滚动由设置页内容区统一承接。 */
export default function QuotaTable({
  columns,
  limits,
  selectedIds,
  sortField,
  sortType,
  loading,
  pageIndex,
  loadingMore,
  projectId,
  businessType,
  clickSubmit,
  limitRowTotal,
  onToggleSelectAll,
  onToggleSelect,
  onSort,
  onChangeItemSize,
  onBlur,
  onReset,
  onRemove,
}) {
  return (
    <div className="list">
      <div className="header flexRow mBottom10">
        <div className="checkColumn pLeft8">
          <Checkbox
            checked={!!limits.length && selectedIds.length === limits.length}
            indeterminate={!!selectedIds.length && selectedIds.length < limits.length}
            onChange={onToggleSelectAll}
          />
        </div>
        {columns.map((item, index) => (
          <div
            key={index}
            className={`pLeft8 ${item.dataIndex} ${item.className ? item.className : undefined}`}
            style={{ width: item.width }}
          >
            {item.sorter ? (
              <div className="sortHeader flexRow alignItemsCenter" onClick={() => onSort(item.dataIndex)}>
                {item.title}
                <div className="sorter flexColumn">
                  <Icon
                    icon="arrow-up"
                    className={cx({ colorPrimary: sortField === item.dataIndex && sortType === 1 })}
                  />
                  <Icon
                    icon="arrow-down"
                    className={cx({ colorPrimary: sortField === item.dataIndex && sortType !== 1 })}
                  />
                </div>
              </div>
            ) : (
              item.title
            )}
          </div>
        ))}
      </div>
      <div className="listContent">
        {loading && pageIndex === 1 ? (
          <LoadDiv />
        ) : _.isEmpty(limits) ? (
          <div className="mTop40 textSecondary TxtCenter">
            {businessType === 2 ? _l('未添加工作表') : _l('未添加应用')}
          </div>
        ) : (
          limits.map((row, index) => (
            <div className="flexRow alignItemsCenter pTop6 pBottom6" key={row.entityId || index}>
              <div className="checkColumn pLeft8">
                <Checkbox
                  checked={_.includes(selectedIds, row.entityId)}
                  onChange={event => onToggleSelect(row.entityId, event.nativeEvent.shiftKey)}
                />
              </div>
              {columns.map((col, columnIndex) => (
                <div
                  key={columnIndex}
                  className={`pLeft8 flexRow ${col.dataIndex} ${col.className ? col.className : ''}`}
                  style={{ width: col.width }}
                >
                  <QuotaCell
                    col={col}
                    data={row}
                    projectId={projectId}
                    businessType={businessType}
                    clickSubmit={clickSubmit}
                    limitRowTotal={limitRowTotal}
                    onChangeItemSize={onChangeItemSize}
                    onBlur={onBlur}
                    onReset={onReset}
                    onRemove={onRemove}
                  />
                </div>
              ))}
            </div>
          ))
        )}
        {loadingMore && <LoadDiv className="mTop10 mBottom10" />}
      </div>
    </div>
  );
}
