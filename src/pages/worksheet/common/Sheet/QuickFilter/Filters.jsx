import React from 'react';
import propTypes from 'prop-types';
import QuickFilter from './QuickFilter';

export default function Filters(props) {
  const {
    projectId,
    showTextAdvanced,
    isDark,
    appId,
    mode,
    filters,
    controls,
    enableBtn,
    activeFilterId,
    updateQuickFilter = () => {},
    resetQuickFilter = () => {},
    onFilterClick = () => {},
  } = props;
  return (
    <QuickFilter
      showTextAdvanced={showTextAdvanced}
      isDark={isDark}
      projectId={projectId}
      appId={appId}
      mode={mode}
      from="filterComp"
      noExpand
      view={{ advancedSetting: { enablebtn: enableBtn ? '1' : '0' } }}
      activeFilterId={activeFilterId}
      filters={filters.map(f => ({ ...f, id: f.id || f.filterId }))}
      controls={controls}
      updateQuickFilter={queryFilters => updateQuickFilter(queryFilters)}
      resetQuickFilter={() => resetQuickFilter()}
      onFilterClick={onFilterClick}
    />
  );
}

Filters.propTypes = {
  projectId: propTypes.string, // 网络 id
  appId: propTypes.string, // 应用 id
  mode: propTypes.string, // 为 "config" 时设置模式
  enableBtn: propTypes.bool, // 是否显示查询按钮
  activeFilterId: propTypes.string, // 当前激活筛选器 id
  filters: propTypes.arrayOf(propTypes.shape({})), // 筛选数据 --同快速筛选配置
  controls: propTypes.arrayOf(propTypes.shape({})), // 字段数据
  updateQuickFilter: propTypes.func, // 更新筛选 返回筛选对象 --同快速筛选配置
  resetQuickFilter: propTypes.func, // 重置筛选条件
  onFilterClick: propTypes.func, // 点击筛选器
};

/**
 * DEMO
 * 配置模式
  <Filters
    mode="config"
    enableBtn={showBtn}
    filters={filters}
    controls={controls}
    activeFilterId={activeFilterId}
    onFilterClick={(id, item) => {
      console.log('new selected filter is', item);
      setActiveFilterId(id);
    }}
  />
 * 查询模式
  <Filters
    enableBtn={showBtn}
    filters={filters}
    controls={controls}
    updateQuickFilter={queryFilters => {
      console.log('updateQuickFilter', queryFilters);
    }}
    resetQuickFilter={() => {
      console.log('resetQuickFilter');
    }}
  />
 */
