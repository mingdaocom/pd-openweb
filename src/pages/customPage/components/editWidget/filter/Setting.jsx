import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { Divider, Input, Switch } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dialog, Dropdown, Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { getIconByType } from 'src/pages/widgetConfig/util';
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
    height: auto;
    min-height: 36px;
    .itemT {
      background: var(--color-background-secondary);
      border-radius: 4px 4px 4px 4px;
      padding: 3px 8px 3px 10px;
      border: 1px solid var(--color-border-secondary);
      margin-right: 5px;
      i {
        color: var(--color-text-tertiary);
        &:hover {
          color: var(--color-text-secondary);
        }
      }
    }
  }

  .ant-checkbox-input {
    position: absolute;
  }
  .ant-input {
    font-size: 13px;
    padding: 5px 11px;
    border-radius: 3px !important;
    &:focus,
    &.ant-input-focused {
      box-shadow: none;
    }
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
  const { pageId, components } = props;
  const [displayType, setDisplayType] = useState('setting');
  const [dropDownVisible, setDropDownVisible] = useState(false);

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
      Dialog.confirm({
        title: null,
        description: (
          <span className="textPrimary Font17" style={{ lineHeight: '26px' }}>
            {_l('将当前所选的筛选对象用于整个组件，其他筛选器的对象将会被重置。')}
          </span>
        ),
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
              <Dropdown
                selectClose={false}
                placeholder={_l('请选择')}
                className={cx('w100 mTop8 fastFilterControlDropdown')}
                renderItem={item => {
                  if (item.value === 'all') {
                    return <div className={'itemText Hand forAll flexRow alignItemsCenter'}>{item.text}</div>;
                  }

                  const isCur = !!safeParse(requiredcids, 'array').includes(item.value);
                  return (
                    <div
                      className={cx('itemText flexRow alignItemsCenter', {
                        isCur,
                      })}
                    >
                      <Icon icon={getIconByType(item.type)} className="Font18 Relative" />
                      <span className="mLeft10 flex textPrimary ellipsis">{item.text}</span>
                      {isCur && <Icon icon="done" className="Relative ThemeColor3 Font18" />}
                    </div>
                  );
                }}
                popupVisible={dropDownVisible}
                onVisibleChange={visible => setDropDownVisible(visible)}
                value={safeParse(requiredcids, 'array').length <= 0 ? undefined : safeParse(requiredcids, 'array')}
                onChange={value => {
                  let data = [];

                  if (!value) {
                    data = [];
                  } else if (safeParse(requiredcids, 'array').includes(value)) {
                    data = safeParse(requiredcids, 'array').filter(o => o !== value);
                  } else {
                    data = [...safeParse(requiredcids, 'array'), value];
                  }

                  handleChangeRequiredcids(JSON.stringify(data));
                }}
                renderTitle={() => {
                  return (
                    <div className="">
                      {(safeParse(requiredcids, 'array') || []).map(it => {
                        const info = filters.filter(control => {
                          return _.get(control.objectControls[0], 'controlId') === it;
                        })[0];
                        const isDel = !info;
                        return (
                          <div className={cx('itemT InlineBlock', { Red: isDel })}>
                            {!isDel ? info.name || _l('未命名') : _l('已删除')}
                            <Icon
                              icon={'close'}
                              className="Hand mLeft3"
                              onClick={e => {
                                e.stopPropagation();
                                let data = safeParse(requiredcids, 'array').filter(a => a !== it);
                                handleChangeRequiredcids(JSON.stringify(data));
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                }}
                border
                menuClass="paramControlDropdownMenu paramControlDropdownMenuSet"
                cancelAble
                isAppendToBody
                openSearch
                data={filters
                  .filter(item => item.dataType !== 36)
                  .map(item => {
                    return {
                      value: _.get(item.objectControls[0], 'controlId'),
                      type: item.dataType,
                      text: item.name || _l('未命名'),
                    };
                  })
                  .filter(item => item.value)}
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
