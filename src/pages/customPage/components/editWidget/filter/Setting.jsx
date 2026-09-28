import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Divider, Input, Modal, Select, Switch, Tooltip } from 'ming-ui/antd-components';
import { getIconByType } from 'src/utils/domain/control/metadata';
import FilterControl from './FilterControl';
import FilterListSort from './FilterListSort';
import FilterObject from './FilterObject';

const Tab = [
  { text: _l('配置'), type: 'setting' },
  { text: _l('样式'), type: 'style' },
];

const Wrap = styled.div`
  box-sizing: border-box;
  width: 360px;
  display: flex;
  flex-direction: column;
  background-color: var(--color-background-secondary);
  overflow: auto;
  position: relative;

  .filterDisplayTab {
    display: flex;
    padding: 0 24px;
    margin-top: 20px;
    li {
      flex: 1;
      padding-bottom: 16px;
      text-align: center;
      border-bottom: 3px solid var(--color-border-secondary);
      transition: all 0.25s;
      cursor: pointer;
      &.active {
        color: var(--color-primary);
        border-bottom-color: var(--color-primary);
      }
    }
  }

  .settingsBox {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }

  .fastFilterControlDropdown {
    min-height: 36px;
  }

  .hap-checkbox-input {
    position: absolute;
  }
  .icon-trash:hover {
    color: var(--color-primary);
  }
`;

function Setting(props) {
  const { filter = {}, updateFilter } = props;
  const { filters = [], setFilters, setActiveId } = props;
  const { filterInfo = {}, setFilterInfo } = props;
  const { advancedSetting = {} } = filterInfo;
  const { pageId, components, widget, mode, activeContainerInfo = {} } = props;
  const [displayType, setDisplayType] = useState('setting');
  const filterWidget =
    mode === 'add' && activeContainerInfo.sectionId
      ? {
          ...widget,
          sectionId: activeContainerInfo.sectionId,
          tabId: activeContainerInfo.tabId,
        }
      : widget;

  const allControls = filters.map(data => {
    const { control, objectControls } = data;
    return control || _.get(objectControls[0], 'control');
  });
  const { requiredcids = [] } = advancedSetting;

  const changeGlobal = e => {
    const { checked } = e.target;
    const { filterId, objectControls } = filter;
    const newFilters = filters.map(f => {
      const data = {
        ...f,
        global: checked,
      };

      if (checked) {
        data.objectControls =
          filterId === f.filterId
            ? objectControls
            : objectControls.map(c => {
                const target = _.find(data.objectControls, { worksheetId: c.worksheetId });

                if (target) {
                  return target;
                } else {
                  return {
                    ...c,
                    controlId: '',
                  };
                }
              });
      }

      return data;
    });

    if (checked) {
      Modal.confirm({
        title: _l('作为全局配置'),
        content: _l('将当前所选的筛选对象用于整个组件，其他筛选器的对象将会被重置。'),
        onOk: () => {
          setFilters(newFilters);
        },
      });
    } else {
      setFilters(newFilters);
    }
  };

  const changeAllFilterObjectControls = objectControls => {
    const { filterId } = filter;
    const newFilters = filters.map(f => {
      const data = {
        ...f,
        objectControls:
          filterId === f.filterId
            ? objectControls
            : objectControls.map(o => {
                const target = _.find(f.objectControls, { worksheetId: o.worksheetId });
                return {
                  ...o,
                  controlId: target && target.controlId ? target.controlId : '',
                  control: target && target.control ? target.control : undefined,
                };
              }),
      };

      if (!data.objectControls.length) {
        data.dataType = 0;
      }

      return data;
    });
    setFilters(newFilters);
  };

  const removeFilter = () => {
    const { filterId } = filter;

    if (filters.length === 1) {
      alert(_l('至少保留一个筛选器'), 3);
      return;
    }

    const newFilters = filters.filter(f => f.filterId !== filterId);
    setFilters(newFilters);
    setActiveId(newFilters[0].filterId);
  };

  const handleChangeRequiredcids = requiredcids => {
    setFilterInfo({
      ...filterInfo,
      advancedSetting: {
        ...advancedSetting,
        requiredcids,
      },
    });
  };

  const requiredControlIds = safeParse(requiredcids, 'array');
  const requiredControlOptions = filters
    .filter(item => item.dataType !== 36)
    .map(item => ({
      value: _.get(item.objectControls[0], 'controlId'),
      type: item.dataType,
      label: item.name || _l('未命名'),
    }))
    .filter(item => item.value);
  const deletedControlOptions = requiredControlIds
    .filter(id => !requiredControlOptions.some(option => option.value === id))
    .map(value => ({ value, label: <span className="Red">{_l('已删除')}</span> }));

  return (
    <Wrap className="setting">
      <ul className="filterDisplayTab">
        {Tab.map(({ text, type }) => (
          <li key={type} className={cx({ active: displayType === type })} onClick={() => setDisplayType(type)}>
            {text}
          </li>
        ))}
      </ul>
      {displayType === 'setting' ? (
        <div className="settingsBox Relative">
          <div className="flexRow valignWrapper textTertiary">
            <div className="flex Font13">{_l('设置筛选器')}</div>
            <Tooltip title={_l('删除')}>
              <div>
                <Icon icon="trash" className="Font20 pointer" onClick={removeFilter} />
              </div>
            </Tooltip>
          </div>
          <Divider className="mTop15 mBottom15" />
          <div className="Font13 bold mBottom10">{_l('筛选器名称')}</div>
          <Input
            className="w100 Font13"
            placeholder={_l('未命名')}
            value={filter.name}
            onChange={e => {
              updateFilter({ name: e.target.value });
            }}
          />
          <Divider className="mTop16 mBottom14" />
          <FilterObject
            pageId={pageId}
            components={components}
            filter={filter}
            filterWidget={filterWidget}
            setFilter={data => {
              if (!data.objectControls.length) {
                data.dataType = 0;
              }

              updateFilter(data);
            }}
            changeGlobal={changeGlobal}
            changeAllFilterObjectControls={changeAllFilterObjectControls}
          />
          {!!_.get(filter, 'objectControls.length') && (
            <Fragment>
              <Divider className="mTop5 mBottom14" />
              <FilterControl
                filter={filter}
                setFilter={updateFilter}
                allControls={allControls}
                filterInfoAdvancedSetting={filterInfo.advancedSetting}
              />
            </Fragment>
          )}
        </div>
      ) : (
        <div className="settingsBox Relative">
          <div className="flexRow valignWrapper">
            <div className="flex bold">{_l('启用筛选按钮')}</div>
            <Switch
              size="small"
              checked={filterInfo.enableBtn}
              onChange={checked => {
                const data = {
                  enableBtn: checked,
                };

                if (!checked) {
                  data.advancedSetting = {
                    ...advancedSetting,
                    requiredcids: undefined,
                  };
                }

                setFilterInfo({
                  ...filterInfo,
                  ...data,
                });
              }}
            />
          </div>
          {filterInfo.enableBtn && (
            <div className="mTop10">
              <div>{_l('查询时必填')}</div>
              <Select
                mode="multiple"
                placeholder={_l('请选择')}
                className={cx('w100 mTop8 fastFilterControlDropdown')}
                optionRender={({ data: item }) => {
                  const isCur = requiredControlIds.includes(item.value);
                  return (
                    <div
                      className={cx('itemText flexRow alignItemsCenter', {
                        isCur,
                      })}
                    >
                      <Icon icon={getIconByType(item.type)} className="Font18 Relative" />
                      <span className="mLeft10 flex textPrimary ellipsis">{item.label}</span>
                      {isCur && <Icon icon="done" className="Relative colorPrimary Font18" />}
                    </div>
                  );
                }}
                value={requiredControlIds}
                onChange={values => handleChangeRequiredcids(JSON.stringify(values))}
                classNames={{ popup: { root: 'paramControlDropdownMenu paramControlDropdownMenuSet' } }}
                allowClear
                showPopupSearch
                optionFilterProp="label"
                options={[...deletedControlOptions, ...requiredControlOptions]}
              />
            </div>
          )}
          <Divider className="mTop15 mBottom15" />
          <div className="flexRow valignWrapper">
            <div className="flexRow valignWrapper flex bold">
              {_l('在执行筛选查询后显示数据')}
              <Tooltip title={_l('勾选后，进入页面初始不显示数据，查询后显示符合筛选条件的数据。')} placement="bottom">
                <Icon className="Font17 pointer textTertiary mLeft10" icon="help" />
              </Tooltip>
            </div>
            <Switch
              size="small"
              checked={advancedSetting.clicksearch == '1'}
              onChange={checked => {
                setFilterInfo({
                  ...filterInfo,
                  advancedSetting: {
                    ...advancedSetting,
                    clicksearch: checked ? '1' : '0',
                  },
                });
              }}
            />
          </div>
          <Divider className="mTop15 mBottom15" />
          <div className="flexColumn">
            <div className="flex bold">{_l('排序')}</div>
            <FilterListSort
              filters={filters}
              onSortEnd={filters => {
                setFilters(filters);
              }}
            />
          </div>
          <Divider className="mTop15 mBottom15" />
        </div>
      )}
    </Wrap>
  );
}

export default connect(state => ({
  appPkg: state.appPkg,
}))(Setting);
