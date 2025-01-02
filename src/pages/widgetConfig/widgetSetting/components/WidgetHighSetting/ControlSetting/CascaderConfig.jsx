import React, { Fragment, useState } from 'react';
import { Checkbox, Dropdown } from 'ming-ui';
import { Tooltip } from 'antd';
import { SettingItem, SheetViewWrap, EditInfo } from '../../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from '../../../../util/setting';
import _ from 'lodash';
import { FilterItemTexts, FilterDialog } from '../../../components/FilterData';
import cx from 'classnames';
import DynamicDefaultValue from '../../DynamicDefaultValue';
import SearchConfig from '../../relateSheet/SearchConfig';

const TOP_SHOW_OPTIONS = [
  { text: _l('全部顶层'), value: '0' },
  { text: _l('满足条件的项'), value: '3' },
  { text: _l('指定项'), value: '2' },
];

const BOTTOM_SHOW_OPTIONS = [
  { text: _l('末层'), value: '0' },
  { text: _l('向后指定层数'), value: '1' },
];

const RANGE_OPTIONS = [
  { text: _l('全部'), value: '1' },
  { text: _l('有查看权限的'), value: '0' },
];

const LEVEL_OPTIONS = [
  { text: _l('必须选择到最后一级'), value: '1' },
  { text: _l('任意选择'), value: '0' },
];

const LAYER_OPTIONS = Array.from({ length: 10 }).map((item, index) => ({
  value: `${index + 1}`,
  text: `${index + 1}层`,
}));

const topFiltersToDefsource = data => {
  const topFilters = getAdvanceSetting(data, 'topfilters') || [];
  const tempDefSourcce = topFilters.map(def => {
    const item = safeParse(def);
    return {
      cid: '',
      rcid: '',
      staticValue: JSON.stringify([_.isObject(item) ? item.id : item]),
      relateSheetName: _.get(item, 'name'),
    };
  });
  return handleAdvancedSettingChange(data, {
    defsource: JSON.stringify(tempDefSourcce),
    defaulttype: '',
  });
};

export default function CascaderConfig(props) {
  const { data, onChange, globalSheetControls } = props;
  const { relationControls = [] } = data;
  const [visibleInfo, setVisibleInfo] = useState({
    filtersVisible: false,
    topfiltersVisible: false,
    searchVisible: false,
  });
  const {
    minlayer = '0',
    allpath,
    storelayer,
    topshow = '0',
    limitlayer = '0',
    searchrange = '1',
    anylevel = '0',
    searchcontrol = '',
  } = getAdvanceSetting(data);
  const filters = getAdvanceSetting(data, 'filters');
  const isEndLayer = Number(limitlayer) > 0;

  const renderFilter = key => {
    const visibleKey = `${key}Visible`;
    const filterData = getAdvanceSetting(data, key) || [];
    return (
      <Fragment>
        {visibleInfo[visibleKey] && (
          <FilterDialog
            {...props}
            filters={filterData}
            supportGroup
            relationControls={relationControls}
            globalSheetControls={globalSheetControls}
            fromCondition={'relateSheet'}
            onChange={({ filters }) => {
              onChange(handleAdvancedSettingChange(data, { [key]: JSON.stringify(filters) }));
              setVisibleInfo({ [visibleKey]: false });
            }}
            onClose={() => setVisibleInfo({ [visibleKey]: false })}
          />
        )}
        {!_.isEmpty(filterData) && (
          <FilterItemTexts
            {...props}
            filters={filterData}
            globalSheetControls={globalSheetControls}
            controls={relationControls}
            editFn={() => setVisibleInfo({ [visibleKey]: true })}
          />
        )}
      </Fragment>
    );
  };

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('过滤数据源')}</div>
        <SheetViewWrap>
          <Dropdown
            border
            className="flex"
            data={RANGE_OPTIONS}
            value={searchrange}
            onChange={value => onChange(handleAdvancedSettingChange(data, { searchrange: value }))}
          />
          <div
            className="filterEditIcon tip-bottom"
            data-tip={_l('过滤选择范围')}
            onClick={() => {
              if (_.isEmpty(filters)) {
                setVisibleInfo({ filtersVisible: true });
              } else {
                onChange(handleAdvancedSettingChange(data, { filters: '' }));
              }
            }}
          >
            <i
              className={cx('icon-filter Font22 LineHeight34', {
                ThemeColor3: filters && filters.length,
              })}
            ></i>
          </div>
        </SheetViewWrap>
        {renderFilter('filters')}
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('选择范围')}</div>
        <div className="settingItemTitle Normal">{_l('开始')}</div>
        <Dropdown
          border
          value={topshow}
          data={TOP_SHOW_OPTIONS}
          onChange={value => {
            if (value === topshow) {
              if (value === '3') {
                setVisibleInfo({ topfiltersVisible: true });
              }
              return;
            }
            onChange(handleAdvancedSettingChange(data, { topshow: value, topfilters: '' }));
            // 满足条件的项
            if (value === '3') {
              setVisibleInfo({ topfiltersVisible: true });
            }
          }}
        />
        {topshow === '3' && renderFilter('topfilters')}
        {topshow === '2' && (
          <DynamicDefaultValue
            {...props}
            data={topFiltersToDefsource(data)}
            className="mTop10"
            hideTitle={true}
            multiple={true}
            hideSearchAndFun={true}
            propFiledVisible={true}
            onChange={newData => {
              const defSource = getAdvanceSetting(newData, 'defsource') || [];
              const tempTopFilters = defSource.map(def => {
                return JSON.stringify({ id: _.get(JSON.parse(def.staticValue), '0'), name: def.relateSheetName });
              });
              onChange(handleAdvancedSettingChange(data, { topfilters: JSON.stringify(tempTopFilters) }));
            }}
          />
        )}

        <div className="settingItemTitle Normal mTop8">{_l('结束')}</div>
        <div className="flexCenter">
          <Dropdown
            className="flex"
            border
            value={isEndLayer ? '1' : '0'}
            data={BOTTOM_SHOW_OPTIONS}
            onChange={value => onChange(handleAdvancedSettingChange(data, { limitlayer: value }))}
          />
          {isEndLayer && (
            <Dropdown
              className="Width70 mLeft10"
              border
              value={limitlayer}
              data={LAYER_OPTIONS}
              onChange={value => onChange(handleAdvancedSettingChange(data, { limitlayer: value }))}
            />
          )}
        </div>
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('选择方式')}</div>
        <Dropdown
          border
          value={anylevel}
          data={LEVEL_OPTIONS}
          onChange={value => {
            if (value === '1') {
              onChange(handleAdvancedSettingChange(data, { anylevel: value }));
            } else {
              onChange(handleAdvancedSettingChange(data, { anylevel: value, minlayer: '' }));
            }
          }}
        />
        {anylevel !== '1' && (
          <Fragment>
            <div className="labelWrap">
              <Checkbox
                size="small"
                checked={!!Number(minlayer)}
                text={_l('至少向后选到的层数')}
                onClick={checked => onChange(handleAdvancedSettingChange(data, { minlayer: checked ? '' : '1' }))}
              />
            </div>
            {!!Number(minlayer) && (
              <Dropdown
                className="mTop8"
                border
                value={minlayer}
                data={LAYER_OPTIONS}
                onChange={value => onChange(handleAdvancedSettingChange(data, { minlayer: value }))}
              />
            )}
          </Fragment>
        )}
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">{_l('其他')}</div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={allpath === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { allpath: String(+!checked) }))}
          >
            <span>{_l('选择结果显示层级路径')}</span>
            <Tooltip
              placement="bottom"
              title={_l(
                '勾选后，将完整展示选项的层级路径，如：上海市/徐汇区/漕河泾。注意，当数据源表记录数大于10000条时，不显示路径。',
              )}
            >
              <i className="icon-help Gray_9e Font16"></i>
            </Tooltip>
          </Checkbox>
        </div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={storelayer === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { storelayer: String(+!checked) }))}
          >
            <span>{_l('存储层级路径')}</span>
            <Tooltip
              placement="bottom"
              title={_l(
                '选中后，将存储选项被选中当下的层级路径，后续不会自动同步路径的变更。若需要获取最新的层级路径，可对该字段进行校准。存储路径后，支持在统计中按层级进行归组统计。',
              )}
            >
              <i className="icon-help Gray_9e Font16"></i>
            </Tooltip>
          </Checkbox>
        </div>
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={!!searchcontrol}
            onClick={() => {
              if (searchcontrol) {
                onChange(
                  handleAdvancedSettingChange(data, {
                    searchcontrol: '',
                    searchtype: '',
                  }),
                );
              }
              setVisibleInfo({ searchVisible: !searchcontrol });
            }}
          >
            <span>{_l('搜索设置')}</span>
            <Tooltip placement="bottom" title={_l('设置按数据源表中记录的具体字段进行搜索。未设置时，按记录搜索。')}>
              <i className="icon-help Gray_9e Font16"></i>
            </Tooltip>
          </Checkbox>
        </div>
        {visibleInfo.searchVisible && (
          <SearchConfig
            {...props}
            title={_l('搜索设置')}
            controls={relationControls}
            onClose={() => setVisibleInfo({ searchVisible: false })}
            onChange={value =>
              onChange(
                handleAdvancedSettingChange(data, _.pick(value.advancedSetting, ['searchtype', 'searchcontrol'])),
              )
            }
          />
        )}
        {searchcontrol && (
          <EditInfo style={{ marginTop: '8px' }} onClick={() => setVisibleInfo({ searchVisible: true })}>
            <div className="text overflow_ellipsis Gray">
              <span className="Bold mRight3">{_l('搜索')}</span>
              {_.get(
                relationControls.find(item => item.controlId === searchcontrol),
                'controlName',
              ) || _l('字段已删除')}
            </div>
            <div className="edit">
              <i className="icon-edit"></i>
            </div>
          </EditInfo>
        )}
      </SettingItem>
    </Fragment>
  );
}
