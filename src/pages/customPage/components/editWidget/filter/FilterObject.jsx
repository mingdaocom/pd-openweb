import React, { Fragment, useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { Checkbox, Divider, Input, Popover, Tooltip } from 'ming-ui/antd-components';
import reportApi from 'statistics/api/report';
import { enumWidgetType } from 'src/utils/domain/customPage/model';
import { containerWidgets, widgets } from '../../../enum';

export const TagWrap = styled.div`
  .tag {
    display: inline-flex;
    padding: 0 10px;
    height: 32px;
    max-width: 100%;
    border: 1px solid var(--color-border-secondary);
    border-radius: 15px;
    background-color: var(--color-background-primary);
    margin: 0 10px 10px 0;
    &.add {
      color: var(--color-primary);
      transition: all 0.3s;
      &:hover {
        color: var(--color-link-hover);
      }
    }
    &.warning {
      border-color: var(--color-error-border);
      background-color: var(--color-error-bg);
    }
  }
  .icon-close:hover {
    color: var(--color-text-secondary) !important;
  }
`;

export const AddTagWrap = styled.div`
  .hap-space {
    gap: 0 !important;
    max-height: 420px;
    overflow-y: auto;
  }
  .hap-checkbox-input {
    position: absolute;
  }
  width: 312px;
  padding: 5px 0;
  .hap-radio-group,
  .hap-space {
    width: 100%;
  }
  .hap-space-item {
    padding: 7px 16px;
    margin-bottom: 0 !important;
    &:hover {
      background-color: var(--color-background-hover);
    }
  }
  &.filterObjectSelectWrap {
    .filterObjectSearch {
      height: 36px;
      padding: 0 14px;
    }
    .filterObjectContent {
      max-height: 390px;
      overflow-y: auto;
      padding: 8px 0;
    }
    .filterObjectRow,
    .filterObjectAllRow {
      display: flex;
      align-items: center;
      min-height: 30px;
      padding: 0 14px;
      &:hover {
        background-color: var(--color-background-hover);
      }
    }
    .filterObjectGroupRow {
      padding-right: 10px;
    }
    .filterObjectChildRow {
      padding-left: 36px;
    }
    .filterObjectCheckbox {
      flex: 1;
      min-width: 0;
      margin-left: 0;
      line-height: 30px;
      .hap-checkbox + span {
        min-width: 0;
        padding-inline-start: 8px;
      }
    }
    .filterObjectName {
      display: block;
      max-width: 100%;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .filterObjectLabel {
      display: flex;
      align-items: center;
      min-width: 0;
    }
    .filterObjectTypeIcon {
      flex: none;
      margin-right: 8px;
      width: 16px;
      text-align: center;
    }
    .filterObjectExpandIcon {
      width: 22px;
      line-height: 30px;
      text-align: center;
    }
    .filterObjectEmpty {
      padding: 24px 0;
      text-align: center;
      color: var(--color-text-tertiary);
    }
  }
`;

const getFilterObjectSaveData = data =>
  _.pick(data, ['objectId', 'type', 'name', 'worksheetId', 'controlId', 'control']);

const getContainerObjectId = component => _.get(component, 'config.objectId');

const getTabGroupKey = item => `${item.sectionId}-${item.tabId}`;

const isTabsWidget = type => [enumWidgetType.tabs, 'tabs'].includes(type);

const isCardWidget = type => [enumWidgetType.card, 'card'].includes(type);

const isFilterObjectSelected = (objectControls, objectId) => !!_.find(objectControls, { objectId });

const getSelectedCount = (objectControls, objects = []) =>
  objects.filter(item => isFilterObjectSelected(objectControls, item.objectId)).length;

const filterObjectByKeyword = (object, keyword) =>
  !keyword || (object.name || '').toLocaleLowerCase().includes(keyword);

const getFilterObjectIcon = type => (type === 1 ? widgets.analysis.icon : widgets.view.icon);

const isInFilterWidgetScope = (object, sectionId, tabId) => {
  if (!sectionId) return true;

  if (tabId) {
    return object.sectionId === sectionId && object.tabId === tabId;
  }

  return object.sectionId === sectionId && !object.tabId;
};

export const getFilterObject = (components = [], reports = [], options = {}) => {
  const { withGroupInfo = false } = options;
  const containerMap = withGroupInfo
    ? components.reduce((result, component) => {
        const objectId = getContainerObjectId(component);

        if (objectId) {
          result[objectId] = component;
        }

        return result;
      }, {})
    : {};

  return components
    .filter(c => [enumWidgetType.analysis, enumWidgetType.view, 'analysis', 'view'].includes(c.type))
    .map(c => {
      const objectId = _.get(c, 'config.objectId');
      const data = { objectId };

      if (enumWidgetType.analysis === c.type) {
        data.type = 1;
        data.name = c.name;
        // 已经存在的图表
        if (c.value) {
          const report = _.find(reports, { id: c.value }) || {};
          data.worksheetId = report.appId;
        }

        // 刚刚复制的图表
        if (c.sourceValue) {
          const report = _.find(reports, { id: c.sourceValue }) || {};
          data.worksheetId = report.appId;
        }
      }

      // 刚刚创建的图表
      if ('analysis' === c.type) {
        data.type = 1;
        data.name = c.name;
        data.worksheetId = c.worksheetId;
      }

      if ([enumWidgetType.view, 'view'].includes(c.type)) {
        data.type = 2;
        data.name = c.config.name;
        data.worksheetId = c.value;
      }

      if (withGroupInfo) {
        const section = containerMap[c.sectionId];
        const tabs = _.get(section, 'componentConfig.tabs') || [];
        const tab = _.find(tabs, { id: c.tabId });

        data.sectionId = c.sectionId;
        data.tabId = c.tabId;
        data.sectionType = _.get(section, 'type');
        data.sectionName = _.get(section, 'componentConfig.name') || _l('卡片');
        data.tabName = _.get(tab, 'name') || _l('标签页');
      }

      return data;
    })
    .filter(c => c.worksheetId);
};

const getFilterObjectGroups = (filterObject = [], search) => {
  const keyword = (search || '').trim().toLocaleLowerCase();
  const rows = [];
  const groupMap = {};

  filterObject.forEach(item => {
    if (isTabsWidget(item.sectionType) && item.tabId) {
      const groupKey = getTabGroupKey(item);

      if (!groupMap[groupKey]) {
        groupMap[groupKey] = {
          type: 'group',
          key: groupKey,
          name: item.tabName,
          icon: containerWidgets.tabs.icon,
          children: [],
        };
        rows.push(groupMap[groupKey]);
      }

      groupMap[groupKey].children.push(item);
      return;
    }

    if (isCardWidget(item.sectionType) && item.sectionId) {
      const groupKey = item.sectionId;

      if (!groupMap[groupKey]) {
        groupMap[groupKey] = {
          type: 'group',
          key: groupKey,
          name: item.sectionName,
          icon: containerWidgets.card.icon,
          children: [],
        };
        rows.push(groupMap[groupKey]);
      }

      groupMap[groupKey].children.push(item);
      return;
    }

    rows.push({
      type: 'object',
      key: item.objectId,
      data: item,
    });
  });

  const visibleRows = rows
    .map(row => {
      if (row.type === 'object') {
        return filterObjectByKeyword(row.data, keyword) ? row : null;
      }

      const group = row;
      const groupMatched = !keyword || (group.name || '').toLocaleLowerCase().includes(keyword);

      return {
        ...group,
        children: groupMatched ? group.children : group.children.filter(item => filterObjectByKeyword(item, keyword)),
      };
    })
    .filter(row => !!row && (row.type === 'object' || row.children.length));

  return {
    rows: visibleRows,
    visibleObjects: visibleRows.reduce((result, row) => {
      return row.type === 'group' ? result.concat(row.children) : result.concat(row.data);
    }, []),
  };
};

export default function FilterObject(props) {
  const { pageId, components, filter, setFilter } = props;
  const { filterWidget, changeGlobal, changeAllFilterObjectControls } = props;
  const { objectControls = [] } = filter;
  const filterWidgetSectionId = _.get(filterWidget, 'sectionId');
  const filterWidgetTabId = _.get(filterWidget, 'tabId');
  const [addTagVisible, setAddTagVisible] = useState(false);
  const [reportsInfo, setReportsInfo] = useState({ pageId: null, data: [] });
  const [search, setSearch] = useState('');
  const [expandedTabs, setExpandedTabs] = useState({});
  const loading = reportsInfo.pageId !== pageId;
  const allFilterObject = useMemo(
    () => getFilterObject(components, reportsInfo.pageId === pageId ? reportsInfo.data : [], { withGroupInfo: true }),
    [components, pageId, reportsInfo.data, reportsInfo.pageId],
  );
  const filterObject = useMemo(
    () => allFilterObject.filter(item => isInFilterWidgetScope(item, filterWidgetSectionId, filterWidgetTabId)),
    [allFilterObject, filterWidgetSectionId, filterWidgetTabId],
  );

  useEffect(() => {
    let unmount = false;

    reportApi
      .listByPageId({ appId: pageId })
      .then(data => {
        if (!unmount) {
          setReportsInfo({ pageId, data: data || [] });
        }
      })
      .catch(() => {
        if (!unmount) {
          setReportsInfo({ pageId, data: [] });
        }
      });

    return () => {
      unmount = true;
    };
  }, [pageId]);

  const changeObjects = objectControls => {
    if (filter.global) {
      changeAllFilterObjectControls(objectControls);
    } else {
      setFilter({
        objectControls,
      });
    }
  };

  const formatObjectControl = (data, controls = objectControls) => {
    const object = getFilterObjectSaveData(data);
    const same = _.find(controls, { worksheetId: object.worksheetId });
    const result = {
      ...object,
      controlId: same ? same.controlId : '',
    };

    if (same && !_.isUndefined(same.control)) {
      result.control = same.control;
    }

    return result;
  };

  const addFilterObjects = objects => {
    const newObjects = objectControls.concat();

    objects.forEach(item => {
      if (_.find(newObjects, { objectId: item.objectId })) return;

      newObjects.push(formatObjectControl(item, newObjects));
    });

    changeObjects(newObjects);
  };

  const removeFilterObjects = ids => {
    const newObjects = objectControls.filter(item => !ids.includes(item.objectId));
    changeObjects(newObjects);
  };

  const addFilterObject = id => {
    const data = _.find(filterObject, { objectId: id });

    if (!data) return;

    addFilterObjects([data]);
  };

  const removeFilterObject = id => {
    removeFilterObjects([id]);
  };

  const renderOverlay = () => {
    const { rows, visibleObjects } = getFilterObjectGroups(filterObject, search);
    const visibleSelectedCount = getSelectedCount(objectControls, visibleObjects);
    const allChecked = !!visibleObjects.length && visibleSelectedCount === visibleObjects.length;
    const allIndeterminate = visibleSelectedCount > 0 && visibleSelectedCount < visibleObjects.length;
    const renderObjectCheckbox = (item, isChild) => (
      <div key={item.objectId} className={cx('filterObjectRow', { filterObjectChildRow: isChild })}>
        <Checkbox
          className="filterObjectCheckbox"
          checked={isFilterObjectSelected(objectControls, item.objectId)}
          onChange={e => {
            const { checked } = e.target;

            if (checked) {
              addFilterObject(item.objectId);
            } else {
              removeFilterObject(item.objectId);
            }
          }}
        >
          <span className="filterObjectLabel" title={item.name}>
            <Icon className="filterObjectTypeIcon textSecondary Font16" icon={getFilterObjectIcon(item.type)} />
            <span className="Font13 filterObjectName">{item.name}</span>
          </span>
        </Checkbox>
      </div>
    );

    const renderTabGroup = group => {
      const selectedCount = getSelectedCount(objectControls, group.children);
      const checked = selectedCount === group.children.length;
      const indeterminate = selectedCount > 0 && selectedCount < group.children.length;
      const expanded = _.isUndefined(expandedTabs[group.key]) ? true : expandedTabs[group.key];

      return (
        <Fragment key={group.key}>
          <div className="filterObjectRow filterObjectGroupRow">
            <Checkbox
              className="filterObjectCheckbox"
              checked={checked}
              indeterminate={indeterminate}
              onChange={e => {
                const { checked } = e.target;

                if (checked) {
                  addFilterObjects(group.children);
                } else {
                  removeFilterObjects(group.children.map(item => item.objectId));
                }
              }}
            >
              <span className="filterObjectLabel" title={group.name}>
                <Icon className="filterObjectTypeIcon textSecondary Font16" icon={group.icon} />
                <span className="Font13 filterObjectName">
                  {group.name} ({selectedCount}/{group.children.length})
                </span>
              </span>
            </Checkbox>
            <Icon
              className="filterObjectExpandIcon textTertiary Font18 pointer"
              icon={expanded ? 'expand_less' : 'expand_more'}
              onClick={() => {
                setExpandedTabs(value => ({ ...value, [group.key]: !expanded }));
              }}
            />
          </div>
          {expanded && group.children.map(item => renderObjectCheckbox(item, true))}
        </Fragment>
      );
    };

    return (
      <AddTagWrap className="filterObjectSelectWrap">
        <div className="filterObjectSearch valignWrapper">
          <Input
            autoFocus
            prefix={<Icon className="textTertiary Font18" icon="search" />}
            variant="borderless"
            value={search}
            placeholder={_l('搜索')}
            onChange={e => {
              setSearch(e.target.value);
            }}
          />
        </div>
        <Divider className="mTop5 mBottom5" />
        <div className="filterObjectContent">
          <div className="filterObjectAllRow">
            <Checkbox
              className="filterObjectCheckbox"
              checked={allChecked}
              disabled={!visibleObjects.length}
              indeterminate={allIndeterminate}
              onChange={e => {
                const { checked } = e.target;

                if (checked) {
                  addFilterObjects(visibleObjects);
                } else {
                  removeFilterObjects(visibleObjects.map(item => item.objectId));
                }
              }}
            >
              <span className="Font13 filterObjectName">{_l('全选')}</span>
            </Checkbox>
          </div>
          {rows.map(row => (row.type === 'group' ? renderTabGroup(row) : renderObjectCheckbox(row.data)))}
          {!visibleObjects.length && <div className="Font13 filterObjectEmpty">{_l('暂无可选组件')}</div>}
        </div>
      </AddTagWrap>
    );
  };

  const renderObject = item => {
    const object = _.find(allFilterObject, { objectId: item.objectId });
    const sameWorksheet = item.worksheetId == _.get(object, 'worksheetId');
    const outOfScope = object && !isInFilterWidgetScope(object, filterWidgetSectionId, filterWidgetTabId);
    const name = _.get(object, 'name');
    return (
      <div
        key={item.objectId}
        className={cx('tag valignWrapper', { warning: !sameWorksheet || !object || outOfScope })}
      >
        <Icon className="textSecondary Font17" icon={item.type === 1 ? 'worksheet_column_chart' : 'view_eye'} />
        {object ? (
          <Fragment>
            <span className="Font13 mLeft5 mRight5 ellipsis" title={name}>
              {name}
            </span>
            {(!sameWorksheet || outOfScope) && (
              <Tooltip
                title={
                  outOfScope
                    ? _l('此对象不在当前筛选器所在的卡片或标签页内，无法筛选。请删除后重新添加')
                    : _l('此对象的数据源工作表已更改，无法筛选。请删除后重新添加')
                }
                placement="bottom"
              >
                <Icon className="Red Font17 pointer mRight2" icon="info" />
              </Tooltip>
            )}
          </Fragment>
        ) : (
          <span className="Font13 Red mLeft5 mRight5">{_l('该筛选对象已删除')}</span>
        )}
        <Icon
          className="textTertiary Font16 pointer"
          icon="close"
          onClick={() => {
            removeFilterObject(item.objectId);
          }}
        />
      </div>
    );
  };

  if (loading) {
    return <LoadDiv />;
  }

  return (
    <Fragment>
      <div className="valignWrapper mBottom8">
        <div className="flex Font13 bold">{_l('筛选对象')}</div>
        <div className="valignWrapper">
          <Tooltip
            title={_l('勾选时，组件内的筛选器使用相同的筛选对象；取消勾选后，可以为每个筛选器设置单独的筛选对象。')}
          >
            <Checkbox checked={filter.global} onChange={changeGlobal}>
              <span className="Font13">{_l('作为全局配置')}</span>
            </Checkbox>
          </Tooltip>
        </div>
      </div>
      <div className="textTertiary Font13 mBottom12 Font13">{_l('选择统计图表或视图组件')}</div>
      <TagWrap>
        {objectControls.map(item => renderObject(item))}
        <Popover
          open={addTagVisible}
          onOpenChange={setAddTagVisible}
          getPopupContainer={() => document.querySelector('.customPageFilterWrap .setting')}
          trigger="click"
          placement="bottomLeft"
          noPadding
          content={renderOverlay()}
        >
          <div className="tag add valignWrapper pointer">
            <Icon className="Font17" icon="add" />
            <span className="bold">{_l('组件')}</span>
          </div>
        </Popover>
      </TagWrap>
    </Fragment>
  );
}
