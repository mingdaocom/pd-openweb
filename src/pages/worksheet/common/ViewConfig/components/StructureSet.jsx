import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Radio, Segmented, Select } from 'ming-ui/antd-components';
import DynamicDefaultValue from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/index.jsx';
import FilterDialog from 'src/pages/widgetConfig/widgetSetting/components/FilterData/FilterDialog';
import FilterItemTexts from 'src/pages/widgetConfig/widgetSetting/components/FilterData/FilterItemTexts';
import {
  CONNECT_LINE_TYPE,
  HIERARCHY_MIX_LEVEL,
  TREE_LINE_TYPE,
} from 'src/pages/worksheet/common/ViewConfig/components/navGroup/util';
import { VIEW_CONFIG_EXCLUDED_CONTROL_TYPES } from 'src/pages/worksheet/common/ViewConfig/config';
import { handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { handleCondition } from 'src/utils/domain/control/conditions';
import { filterHidedControls } from 'src/utils/domain/control/sort';
import { VIEW_DISPLAY_TYPE } from 'src/utils/domain/worksheet/constants';
import HierarchyViewSetting from './hierarchyViewSetting';
import StructureType from './StructureType';

const SELECT_FIELD_NAMES = { label: 'text', value: 'value' };
const DEFAULT_LAYER_OPTIONS = ['1', '2', '3', '4', '5'];

const Wrap = styled.div`
  .topShowCon {
    width: 100%;
  }
  .line {
    border-bottom: 1px solid var(--color-border-secondary);
    width: 100%;
    height: 0;
  }
  .topShowItemCon {
    & > div > div > div {
      border-radius: 4px;
    }
  }
`;

const HierarchyViewConnectLineConfigWrap = styled(Radio.Group)`
  .hap-radio-wrapper:first-child {
    margin-right: 60px;
  }
`;

const TOP_SHOW_OPTIONS = [
  { label: _l('全部顶层'), value: '0' },
  { label: _l('满足条件的项'), value: '3' },
  { label: _l('指定项'), value: '2' },
];

export default function StructureSet(props) {
  const { columns = [], view, updateCurrentView, appId, projectId, worksheetId } = props;
  const [visibleInfo, setVisibleInfo] = useState({
    filtersVisible: false,
    topfiltersVisible: false,
  });
  const viewTypeText = VIEW_DISPLAY_TYPE[view.viewType];
  const isRelateMultiSheetHierarchyView = viewTypeText === 'structure' && String(view.childType) === '2';

  const topFiltersToDefsource = () => {
    const topFilters = getAdvanceSetting(view, 'topfilters') || [];
    const tempDefSourcce = topFilters.map(def => {
      const item = safeParse(def);
      return {
        cid: '',
        rcid: '',
        staticValue: JSON.stringify([_.isObject(item) ? item.id : item]),
        relateSheetName: _.get(item, 'name'),
      };
    });
    let info = {
      type: 35,
      dataSource: worksheetId,
      viewId: '',
      advancedSetting: {
        topshow: _.get(view, 'advancedSetting.topshow'),
        topfilters: _.get(view, 'advancedSetting.topfilters'),
      },
    };
    return handleAdvancedSettingChange(info, {
      defsource: JSON.stringify(tempDefSourcce),
      defaulttype: '',
    });
  };

  const renderFilter = key => {
    const visibleKey = `${key}Visible`;
    const filterData = getAdvanceSetting(view, key) || [];
    const globalSheetControls = [];
    const globalSheetInfo = {
      appId,
      projectId,
      worksheetId,
    };
    const relationControls = columns;
    return (
      <Fragment>
        {visibleInfo[visibleKey] && (
          <FilterDialog
            {...props}
            globalSheetInfo={globalSheetInfo}
            filters={filterData}
            supportGroup
            title={_l('筛选')}
            helpHref="https://help.mingdao.com/view/org/"
            relationControls={relationControls}
            globalSheetControls={globalSheetControls}
            fromCondition={'viewControl'}
            allControls={columns}
            onChange={({ filters }) => {
              let filtersValue = [];

              if (filters.some(item => item.groupFilters)) {
                filtersValue = filters.map(f => {
                  return {
                    ...f,
                    groupFilters: (f.groupFilters || []).map(handleCondition),
                  };
                });
              } else {
                filtersValue = filters.map(handleCondition);
              }

              updateCurrentView({
                ...view,
                appId,
                advancedSetting: {
                  [key]: JSON.stringify(filtersValue),
                },
                editAttrs: ['advancedSetting'],
                editAdKeys: [key],
              });
              setVisibleInfo({ [visibleKey]: false });
            }}
            onClose={() => setVisibleInfo({ [visibleKey]: false })}
          />
        )}
        {!_.isEmpty(filterData) && (
          <FilterItemTexts
            {...props}
            loading={false}
            globalSheetInfo={globalSheetInfo}
            filters={filterData}
            globalSheetControls={globalSheetControls}
            controls={relationControls}
            allControls={columns}
            editFn={() => setVisibleInfo({ [visibleKey]: true })}
          />
        )}
      </Fragment>
    );
  };

  const filteredColumns = filterHidedControls(columns, view.controls, false)
    .filter(c => !!c.controlName && !_.includes(VIEW_CONFIG_EXCLUDED_CONTROL_TYPES, c.type))
    .sort((a, b) => {
      if (a.row === b.row) {
        return a.col - b.col;
      } else {
        return a.row - b.row;
      }
    });
  // 画廊视图封面需要嵌入字段，其他配置过滤
  const coverColumns = filterHidedControls(columns, view.controls, false).filter(c => !!c.controlName);
  return (
    <Wrap>
      {isRelateMultiSheetHierarchyView && (
        <React.Fragment>
          <div className="title Font13 bold mBottom18">{_l('多表关联字段')}</div>
          <HierarchyViewSetting {...props} filteredColumns={filteredColumns} coverColumns={coverColumns} />
          <div className="line mTop32 mBottom32"></div>
        </React.Fragment>
      )}
      <StructureType isRelateMultiSheetHierarchyView={isRelateMultiSheetHierarchyView} />
      {(_.get(view, 'advancedSetting.hierarchyViewType') || '0') === '0' && (
        <div className="title mBottom18 valignWrapper">
          <span className="Font13 bold mRight60">{_l('连接线样式')}</span>
          <HierarchyViewConnectLineConfigWrap
            size="middle"
            value={_.get(view, 'advancedSetting.hierarchyViewConnectLine') || '0'}
            options={CONNECT_LINE_TYPE.map(({ text, ...option }) => ({ ...option, label: text }))}
            onChange={event => {
              const value = event.target.value;

              if ((_.get(view, 'advancedSetting.hierarchyViewConnectLine') || '0') === value) {
                return;
              }

              updateCurrentView({
                ...view,
                appId,
                advancedSetting: {
                  hierarchyViewConnectLine: value,
                },
                editAttrs: ['advancedSetting'],
                editAdKeys: ['hierarchyViewConnectLine'],
              });
            }}
          />
        </div>
      )}
      {(_.get(view, 'advancedSetting.hierarchyViewType') || '0') === '2' && (
        <Fragment>
          <div className="title title Font13 bold mBottom8">{_l('竖向层级数')}</div>
          <Select
            options={HIERARCHY_MIX_LEVEL}
            fieldNames={SELECT_FIELD_NAMES}
            value={_.get(view, 'advancedSetting.minHierarchyLevel') || (isRelateMultiSheetHierarchyView ? '2' : '0')}
            style={{ width: '100%' }}
            onChange={value => {
              if (
                (_.get(view, 'advancedSetting.minHierarchyLevel') || (isRelateMultiSheetHierarchyView ? '2' : '0')) ===
                value
              ) {
                return;
              }

              updateCurrentView({
                ...view,
                appId,
                advancedSetting: {
                  minHierarchyLevel: value,
                },
                editAttrs: ['advancedSetting'],
                editAdKeys: ['minHierarchyLevel'],
              });
            }}
            placeholder={_l('2级')}
          />
        </Fragment>
      )}
      {!isRelateMultiSheetHierarchyView && _.get(view, 'advancedSetting.hierarchyViewType') !== '3' && (
        <React.Fragment>
          <div className="title Font13 mTop24 bold">{_l('开始层级')}</div>
          <div className="settingContent">
            <Select
              className="topShowCon"
              value={_.get(view, 'advancedSetting.topshow') || '0'}
              options={TOP_SHOW_OPTIONS}
              onChange={value => {
                // 满足条件的项
                if (value === '3') {
                  setVisibleInfo({ topfiltersVisible: true });
                }

                if (value === (_.get(view, 'advancedSetting.topshow') || '0')) return;
                updateCurrentView({
                  ...view,
                  appId,
                  advancedSetting: {
                    topshow: value,
                    topfilters: '',
                  },
                  editAttrs: ['advancedSetting'],
                  editAdKeys: ['topshow', 'topfilters'],
                });
              }}
            />
            {_.get(view, 'advancedSetting.topshow') === '3' && renderFilter('topfilters')}
            {_.get(view, 'advancedSetting.topshow') === '2' && (
              <div className="mTop10 topShowItemCon">
                <DynamicDefaultValue
                  {...props}
                  getType={7}
                  data={topFiltersToDefsource()}
                  hideTitle={true}
                  multiple={true}
                  hideSearchAndFun={true}
                  propFiledVisible={true}
                  globalSheetInfo={{ worksheetId, appId, projectId }}
                  onChange={newData => {
                    const defSource = getAdvanceSetting(newData, 'defsource') || [];
                    const tempTopFilters = [];
                    defSource.map(def => {
                      tempTopFilters.push(_.get(safeParse(def.staticValue, 'array'), '0'));
                    });
                    updateCurrentView({
                      ...view,
                      appId,
                      advancedSetting: {
                        topfilters: JSON.stringify(tempTopFilters),
                      },
                      editAttrs: ['advancedSetting'],
                      editAdKeys: ['topfilters'],
                    });
                  }}
                />
              </div>
            )}
          </div>
        </React.Fragment>
      )}
      {_.get(view, 'advancedSetting.hierarchyViewType') === '3' && (
        <div className="title mBottom18 valignWrapper">
          <span className="Font13 bold mRight60">{_l('树样式')}</span>
          <HierarchyViewConnectLineConfigWrap
            size="middle"
            value={_.get(view, 'advancedSetting.treestyle') || '1'}
            options={TREE_LINE_TYPE.map(({ text, ...option }) => ({ ...option, label: text }))}
            onChange={event => {
              const value = event.target.value;

              if ((_.get(view, 'advancedSetting.treestyle') || '1') === value) {
                return;
              }

              updateCurrentView({
                ...view,
                appId,
                advancedSetting: {
                  treestyle: value,
                },
                editAttrs: ['advancedSetting'],
                editAdKeys: ['treestyle'],
              });
            }}
          />
        </div>
      )}
      <React.Fragment>
        <div className="commonConfigItem Font13 mTop24 bold mTop4">{_l('默认展开层级')}</div>
        <Segmented
          block
          className="mTop8"
          value={_.get(props, 'view.advancedSetting.defaultlayer') || '1'}
          options={DEFAULT_LAYER_OPTIONS}
          onChange={value => {
            const { viewId } = view;
            const config = safeParse(localStorage.getItem(`hierarchyConfig-${viewId}`));
            const defaultlayertime = new Date().getTime();
            safeLocalStorageSetItem(
              `hierarchyConfig-${viewId}`,
              JSON.stringify({ ...config, level: Number(value), levelUpdateTime: defaultlayertime }),
            );
            updateCurrentView({
              ...view,
              appId,
              advancedSetting: { defaultlayer: value, defaultlayertime },
              editAdKeys: ['defaultlayer', 'defaultlayertime'],
              editAttrs: ['advancedSetting'],
            });
          }}
        />
      </React.Fragment>
    </Wrap>
  );
}
