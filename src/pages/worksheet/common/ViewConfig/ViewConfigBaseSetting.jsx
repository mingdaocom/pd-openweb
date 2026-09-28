import React from 'react';
import _ from 'lodash';
import { VIEW_DISPLAY_TYPE } from 'src/utils/domain/worksheet/constants';
import { formatValuesOfOriginConditions } from 'src/utils/domain/worksheet/filterValue';
import CardAppearance from './CardAppearance';
import {
  CalendarSet,
  CardSet,
  DetailSet,
  GunterSet,
  HierarchyViewSetting,
  MapSetting,
  ParameterSet,
  RefreshTime,
  ResourceSet,
  StructureSet,
  TableSet,
  TitleControl,
} from './components';
import { getCardSettingColumns, getCoverColumns, isDevCustomView } from './helpers';

// 卡片设置只透传实际会消费的视图上下文，避免把 ViewConfig 的所有 props 继续扩散。
const CARD_SETTING_PROPS = [
  'appId',
  'view',
  'columns',
  'worksheetControls',
  'updateCurrentView',
  'currentSheetInfo',
  'searchRows',
  'updateViewShowcount',
];

// 看板/层级外观配置需要应用、项目、工作表和刷新上下文，统一收口在这里维护。
const APPEARANCE_SETTING_PROPS = [
  'appId',
  'projectId',
  'worksheetId',
  'view',
  'columns',
  'worksheetControls',
  'updateCurrentView',
  'currentSheetInfo',
  'searchRows',
  'updateViewShowcount',
];

// 地图设置与卡片外观类似，但不需要项目和工作表 id，单独列出避免误传无关字段。
const MAP_SETTING_PROPS = [
  'appId',
  'view',
  'columns',
  'worksheetControls',
  'updateCurrentView',
  'currentSheetInfo',
  'searchRows',
  'updateViewShowcount',
];

// 画廊配置和右侧“卡片设置”复用同一套字段筛选与层级视图分支。
export function ViewCardSet({ viewProps }) {
  const { columns = [], view = {} } = viewProps;
  const filteredColumns = getCardSettingColumns(columns, view.controls);
  // 画廊视图封面需要嵌入字段，其他配置过滤。
  const coverColumns = getCoverColumns(columns, view.controls);
  const viewTypeText = VIEW_DISPLAY_TYPE[view.viewType];
  const isRelateMultiSheetHierarchyView = viewTypeText === 'structure' && String(view.childType) === '2';

  if (isRelateMultiSheetHierarchyView) {
    return (
      <HierarchyViewSetting {...viewProps} filteredColumns={filteredColumns} coverColumns={coverColumns} forCarSet />
    );
  }

  return (
    <CardSet
      {..._.pick(viewProps, CARD_SETTING_PROPS)}
      worksheetControls={filteredColumns}
      coverColumns={coverColumns}
    />
  );
}

// 资源、甘特、日历视图在基础设置后额外提供标题字段配置。
function ViewTitleSet({ viewProps, viewTypeText }) {
  const { updateCurrentView, view = {} } = viewProps;

  switch (viewTypeText) {
    case 'resource':
    case 'gunter':
    case 'calendar':
      return (
        <TitleControl
          {...viewProps}
          title={viewTypeText === 'gunter' ? _l('标签名称') : null}
          isCard={false}
          className="mTop32"
          advancedSetting={_.get(view, 'advancedSetting')}
          handleChange={value => {
            updateCurrentView({
              ...view,
              advancedSetting: { viewtitle: value },
              editAttrs: ['advancedSetting'],
              editAdKeys: ['viewtitle'],
            });
          }}
        />
      );
    default:
      return null;
  }
}

export default function ViewConfigBaseSetting({ viewProps, onChangeCustomView }) {
  const { columns = [], view = {}, updateCurrentView } = viewProps;
  const viewTypeText = VIEW_DISPLAY_TYPE[view.viewType];

  if (viewTypeText === 'customize' && !isDevCustomView(view)) {
    return <ParameterSet {...viewProps} onChangeView={onChangeCustomView} />;
  }

  const filteredColumns = getCardSettingColumns(columns, view.controls);
  const coverColumns = getCoverColumns(columns, view.controls);

  const updateCurrentViewWithFilters = nextView => {
    updateCurrentView(
      Object.assign(nextView, {
        filters: formatValuesOfOriginConditions(nextView.filters),
      }),
    );
  };

  const param = {
    ...viewProps,
    updateCurrentView: updateCurrentViewWithFilters,
  };

  const renderBaseConfig = () => {
    switch (viewTypeText) {
      case 'board':
      case 'structure':
        if (viewTypeText === 'structure' && String(view.childType) === '2') {
          return <StructureSet {..._.pick(viewProps, APPEARANCE_SETTING_PROPS)} />;
        }

        return (
          <div className="cardAppearanceWrap">
            <CardAppearance {..._.pick(viewProps, APPEARANCE_SETTING_PROPS)} worksheetControls={filteredColumns} />
          </div>
        );
      case 'gallery':
        return <ViewCardSet viewProps={viewProps} />;
      case 'detail':
        return <DetailSet {...param} />;
      case 'calendar':
        return <CalendarSet {...param} />;
      case 'gunter':
        return <GunterSet {...param} />;
      case 'resource':
        return <ResourceSet {...param} />;
      case 'sheet':
        return <TableSet {..._.pick(viewProps, ['appId', 'view', 'updateCurrentView'])} />;
      case 'map':
        return (
          <MapSetting
            {..._.pick(viewProps, MAP_SETTING_PROPS)}
            worksheetControls={filteredColumns}
            coverColumns={coverColumns}
            updateCurrentView={updateCurrentViewWithFilters}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="viewConfigWrap">
      {renderBaseConfig()}
      <ViewTitleSet viewProps={viewProps} viewTypeText={viewTypeText} />
      <RefreshTime {...viewProps} />
    </div>
  );
}
