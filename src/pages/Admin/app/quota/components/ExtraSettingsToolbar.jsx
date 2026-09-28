import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Select } from 'ming-ui/antd-components';
import { isUsageResetSupported } from '../utils';

/** 额外配置工具栏，负责筛选区，以及新增入口/批量操作的互斥展示。 */
export default function ExtraSettingsToolbar({
  businessType,
  appIds,
  appList,
  worksheetIds,
  worksheetList,
  isMoreApp,
  appPageIndex,
  loadingApp = false,
  selectedIds = [],
  resetLoading,
  resettableRows = [],
  onSearchApps,
  onClearApps,
  onLoadMoreApps,
  onCloseApps,
  onChangeApps,
  onChangeWorksheets,
  onQuery,
  onResetFilters,
  onResetUsage,
  onBatchEdit,
  onBatchRemove,
  onAdd,
}) {
  const hasSelected = !!selectedIds.length;
  const canResetUsage = isUsageResetSupported(businessType);

  return (
    <div className="addAndFilterWrap mBottom10">
      {hasSelected ? (
        <div className="batchActions flexRow alignItemsCenter">
          <span className="bold">{_l('已选中%0项', selectedIds.length)}</span>
          {canResetUsage && !!resettableRows.length && (
            <span
              className={cx('batchAction', { disabled: resetLoading })}
              onClick={() => !resetLoading && onResetUsage(resettableRows, selectedIds.length)}
            >
              {_l('重置用量')}
            </span>
          )}
          <span className="batchAction" onClick={onBatchEdit}>
            {_l('批量修改')}
          </span>
          <span className="batchAction" onClick={onBatchRemove}>
            {_l('批量移除')}
          </span>
        </div>
      ) : (
        <div className="add" onClick={onAdd}>
          <i className="icon icon-plus" />
          <span>{businessType === 2 ? _l('工作表') : _l('应用')}</span>
        </div>
      )}
      <div className="filterWrap flexRow alignItemsCenter">
        <div className="flexRow alignItemsCenter">
          <div className="mRight10 textSecondary">{_l('应用')}</div>
          <Select
            className="w200 mRight20"
            placeholder={_l('所属应用')}
            showSearch
            allowClear
            value={appIds}
            mode="multiple"
            maxTagCount="responsive"
            loading={loadingApp}
            notFoundContent={<span className="textTertiary">{_l('无搜索结果')}</span>}
            filterOption={false}
            onSearch={onSearchApps}
            onPopupScroll={event => {
              event.persist();
              const { scrollTop, offsetHeight, scrollHeight } = event.target;
              if (scrollTop + offsetHeight === scrollHeight && isMoreApp) onLoadMoreApps();
            }}
            onFocus={appPageIndex === 1 && _.isEmpty(appList) ? onLoadMoreApps : undefined}
            onOpenChange={open => !open && businessType !== 2 && onCloseApps()}
            onChange={value => (_.isEmpty(value) ? onClearApps() : onChangeApps(value))}
            options={appList}
          />
        </div>
        {businessType === 2 && (
          <div className="flexRow alignItemsCenter">
            <div className="mRight10 textSecondary">{_l('工作表')}</div>
            <Select
              className="w200"
              placeholder={_l('请选择')}
              showSearch
              allowClear
              value={worksheetIds}
              mode="multiple"
              maxTagCount="responsive"
              disabled={_.isEmpty(appIds)}
              notFoundContent={<span className="textTertiary">{_l('无搜索结果')}</span>}
              optionFilterProp="label"
              onClear={() => onChangeWorksheets([])}
              onChange={onChangeWorksheets}
              options={worksheetList}
            />
          </div>
        )}
        {businessType === 2 && (
          <React.Fragment>
            <Button type="primary" className="pLeft16 pRight16 mLeft20" onClick={onQuery}>
              {_l('查询')}
            </Button>
            <Button color="primary" variant="text" className="mLeft20" onClick={onResetFilters}>
              {_l('重置')}
            </Button>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}
