import React, { Component } from 'react';
import cx from 'classnames';
import _, { get } from 'lodash';
import { Icon, ScrollView } from 'ming-ui';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import pluginAjax from 'src/api/plugin.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget.js';
import { WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/enum';
import { formatAdvancedSettingByNavfilters } from 'src/pages/worksheet/common/ViewConfig/util';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum';
import { filterHidedControls } from 'src/pages/worksheet/util';
import { formatValuesOfOriginConditions } from '../../common/WorkSheetFilter/util';
import CardAppearance from './CardAppearance';
import {
  ActionSet,
  BatchSet,
  CalendarSet,
  CardSet,
  Controls,
  DebugConfig,
  DetailSet,
  FastFilter,
  GunterSet,
  HierarchyViewSetting,
  MapSetting,
  MobileSet,
  NavGroup,
  ParameterSet,
  PluginSettings,
  RecordColor,
  RefreshTime,
  ResourceSet,
  Show,
  SideNav,
  Sort,
  SortConditions,
  StructureSet,
  SubmitConfig,
  TableSet,
  TitleControl,
  UrlParams,
  ViewFilter,
} from './components';
import { baseSetList, viewTypeConfig } from './config';

@errorBoundary
export default class ViewConfigCon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      view: props.view,
      viewSetting: baseSetList[VIEW_DISPLAY_TYPE[_.get(props, 'view.viewType') || 0]][0],
      showBatch: false,
    };
  }

  componentDidMount() {
    this.fetchBtnByAll();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.viewId !== this.props.viewId) {
      const { view = {}, viewConfigTab, setViewConfigTab } = nextProps;
      const isDevCustomView = (_.get(view, 'pluginInfo') || {}).source === 0; //是否可以开发状态的自定义视图
      if (!!viewConfigTab) {
        setViewConfigTab('');
      }
      this.setState({
        viewSetting: !!viewConfigTab
          ? viewConfigTab
          : VIEW_DISPLAY_TYPE[view.viewType] === 'customize' && isDevCustomView
            ? 'PluginSettings'
            : 'Setting',
      });
    }
    if (!_.isEqual(nextProps.view.moreSort, this.props.view.moreSort)) {
      this.setState({
        view: nextProps.view,
      });
    }
  }

  fetchBtnByAll = () => {
    const { worksheetId, appId, rowId } = this.props;
    this.props.refreshFn(worksheetId, appId, '', rowId);
  };

  //字段的columns 排除系统字段 (拥有者除外,且拥有者排在第一个)
  formatColumnsListForControlsWithoutHide = columns => {
    let data = columns.filter(column => !ALL_SYS.includes(column.controlId));
    data = columns.filter(o => o.controlId === 'ownerid').concat(data.filter(o => o.controlId !== 'ownerid'));
    return data;
  };

  renderCardSet = () => {
    const { columns, view } = this.props;
    const filteredColumns = filterHidedControls(columns, view.controls, false)
      .filter(c => !!c.controlName && !_.includes([22, 10010, 43, 45, 49, 51], c.type))
      .sort((a, b) => {
        if (a.row === b.row) {
          return a.col - b.col;
        } else {
          return a.row - b.row;
        }
      });
    // 画廊视图封面需要嵌入字段，其他配置过滤
    const coverColumns = filterHidedControls(columns, view.controls, false).filter(c => !!c.controlName);
    const viewTypeText = VIEW_DISPLAY_TYPE[view.viewType];
    const isRelateMultiSheetHierarchyView = viewTypeText === 'structure' && String(view.childType) === '2';
    if (isRelateMultiSheetHierarchyView) {
      return (
        <HierarchyViewSetting {...this.props} filteredColumns={filteredColumns} coverColumns={coverColumns} forCarSet />
      );
    }
    return (
      <CardSet
        {..._.pick(this.props, [
          'appId',
          'view',
          'columns',
          'worksheetControls',
          'updateCurrentView',
          'currentSheetInfo',
          'searchRows',
          'updateViewShowcount',
        ])}
        worksheetControls={filteredColumns}
        coverColumns={coverColumns}
      />
    );
  };

  renderViewSetting() {
    const { columns, view } = this.props;
    const isDevCustomView = (_.get(view, 'pluginInfo') || {}).source === 0; //是否可以开发状态的自定义视图
    if (VIEW_DISPLAY_TYPE[view.viewType] === 'customize' && !isDevCustomView) {
      return <ParameterSet {...this.props} onChangeView={this.onChangeCustomView} />;
    }
    const viewTypeText = VIEW_DISPLAY_TYPE[view.viewType];
    const filteredColumns = filterHidedControls(columns, view.controls, false)
      .filter(c => !!c.controlName && !_.includes([22, 10010, 43, 45, 49, 51], c.type))
      .sort((a, b) => {
        if (a.row === b.row) {
          return a.col - b.col;
        } else {
          return a.row - b.row;
        }
      });
    // 画廊视图封面需要嵌入字段，其他配置过滤
    const coverColumns = filterHidedControls(columns, view.controls, false).filter(c => !!c.controlName);
    /* 多表关联层级视图 */
    const param = {
      ...this.props,
      updateCurrentView: view => {
        this.props.updateCurrentView(
          Object.assign(view, {
            filters: formatValuesOfOriginConditions(view.filters),
          }),
        );
      },
    };
    const renderCom = () => {
      switch (viewTypeText) {
        case 'board':
        case 'structure':
          const isRelateMultiSheetHierarchyView = viewTypeText === 'structure' && String(view.childType) === '2';
          if (!isRelateMultiSheetHierarchyView) {
            return (
              <div className="cardAppearanceWrap">
                <CardAppearance
                  {..._.pick(this.props, [
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
                  ])}
                  worksheetControls={filteredColumns}
                />
              </div>
            );
          } else {
            return (
              <StructureSet
                {..._.pick(this.props, [
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
                ])}
              />
            );
          }
        case 'gallery':
          return this.renderCardSet();
        case 'detail':
          return <DetailSet {...param} />;
        case 'calendar':
          return <CalendarSet {...param} />;
        case 'gunter':
          return <GunterSet {...param} />;
        case 'resource':
          return <ResourceSet {...param} />;
        case 'sheet':
          return <TableSet {..._.pick(this.props, ['appId', 'view', 'updateCurrentView'])} />;
        case 'map':
          return (
            <MapSetting
              {..._.pick(this.props, [
                'appId',
                'view',
                'columns',
                'worksheetControls',
                'updateCurrentView',
                'currentSheetInfo',
                'searchRows',
                'updateViewShowcount',
              ])}
              worksheetControls={filteredColumns}
              coverColumns={coverColumns}
              updateCurrentView={view => {
                this.props.updateCurrentView(
                  Object.assign(view, {
                    filters: formatValuesOfOriginConditions(view.filters),
                  }),
                );
              }}
            />
          );
      }
    };
    const renderTitleSet = () => {
      const { updateCurrentView } = this.props;
      switch (viewTypeText) {
        case 'resource':
        case 'gunter':
        case 'calendar':
          return (
            <TitleControl
              {...this.props}
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
    };
    return (
      <div className="viewConfigWrap">
        {renderCom()}
        {renderTitleSet()}
        <RefreshTime {...this.props} />
      </div>
    );
  }

  editPlugin = data => {
    const { updateCurrentViewState, view, appId } = this.props;
    const { pluginInfo = {}, viewId } = view;
    const { id, source = 0 } = pluginInfo;
    pluginAjax
      .edit({
        id, //插件id
        source,
        viewId,
        appId,
        ...data,
      })
      .then(res => {
        updateCurrentViewState({
          pluginInfo: res,
        });
      });
  };

  onChangeCustomView = (data, isPlugin, others) => {
    const { updateCurrentView, view, appId } = this.props;
    if (isPlugin) {
      this.editPlugin(data);
    } else {
      updateCurrentView({
        ...view,
        appId,
        editAttrs: ['advancedSetting'],
        ...others,
        advancedSetting: formatAdvancedSettingByNavfilters(view, _.omit({ ...data }, 'navfilters')),
      });
    }
  };

  renderSetting = () => {
    const { viewSetting } = this.state;
    const {
      onShowCreateCustomBtn,
      worksheetId,
      appId,
      columns,
      view = {},
      refreshFn,
      btnList,
      viewId,
      sheetSwitchPermit,
      worksheetControls,
      updateCurrentView,
    } = this.props;

    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);

    switch (viewSetting) {
      case 'ActionSet': // 自定义动作
        return (
          <ActionSet
            worksheetControls={worksheetControls}
            isSheetView={VIEW_DISPLAY_TYPE[view.viewType] === 'sheet'}
            onShowCreateCustomBtn={onShowCreateCustomBtn}
            worksheetId={worksheetId}
            appId={appId}
            viewId={viewId}
            refreshFn={refreshFn}
            btnList={btnList}
            updateCurrentView={this.props.updateCurrentView}
            view={view}
          />
        );
      case 'Filter': // 筛选
        return <ViewFilter {...this.props} />;
      case 'Sort': // 排序
        return <Sort {...this.props} />;
      case 'Controls': // 字段
        return <Controls {...this.props} formatColumnsListForControls={this.formatColumnsListForControlsWithoutHide} />;
      case 'MobileSet': // 移动端设置
        return (
          <MobileSet
            {...this.props}
            worksheetControls={
              isShowWorkflowSys
                ? this.props.worksheetControls
                : this.props.worksheetControls.filter(c => !_.includes(WORKFLOW_SYSTEM_FIELDS_SORT, c.controlId))
            }
            isShowWorkflowSys={isShowWorkflowSys}
            coverColumns={filterHidedControls(columns, view.controls, false).filter(
              c => !!c.controlName && !_.includes([45], c.type), //移动端暂不支持嵌入字段作为封面
            )}
          />
        );
      case 'FastFilter': // 快速筛选
        return <FastFilter {...this.props} />;
      case 'NavGroup': // 分组筛选
        return <NavGroup {...this.props} />;
      case 'RecordColor': // 颜色
        return <RecordColor {...this.props} />;
      case 'Show': // 显示列
        return <Show {...this.props} />;
      case 'urlParams':
        return <UrlParams {...this.props} />;
      case 'PluginSettings':
        return (
          <PluginSettings
            {...this.props}
            onUpdateTab={value => {
              this.setState({ viewSetting: value });
            }}
            onChangeView={this.onChangeCustomView}
          />
        );
      case 'ParameterSet':
        return <ParameterSet {...this.props} onChangeView={this.onChangeCustomView} />;
      case 'Submit':
        return <SubmitConfig {...this.props} onChangeView={this.onChangeCustomView} />;
      case 'CardSet':
        return <div className="mTop24">{this.renderCardSet()}</div>;
      case 'TableSet':
        return (
          <div className="mTop24">
            <TableSet {..._.pick(this.props, ['appId', 'view', 'updateCurrentView'])} />
          </div>
        );
      default:
        const isDevCustomView = (_.get(view, 'pluginInfo') || {}).source === 0; //是否可以开发状态的自定义视图
        if (VIEW_DISPLAY_TYPE[view.viewType] === 'customize' && isDevCustomView) {
          return <DebugConfig {...this.props} onChangeView={this.onChangeCustomView} />;
        }
        return this.renderViewSetting(); // 基础设置
    }
  };

  render() {
    const { viewSetting, showBatch } = this.state;
    const data = viewTypeConfig.find((item, i) => item.type === viewSetting) || {};
    const conRender = () => {
      const { view } = this.props;
      const isDevCustomView = (_.get(view, 'pluginInfo') || {}).source === 0; //是否可以开发状态的自定义视图
      return (
        <div className={cx('viewContentCon', { H100: ['Submit', 'Filter'].includes(data.type) })}>
          {!['MobileSet', 'FastFilter', 'NavGroup', 'RecordColor', 'ActionSet', 'Submit', 'Filter'].includes(
            data.type,
          ) && (
            <div className="viewSetTitle flexRow">
              <div className="flex">
                {data.type === 'Setting'
                  ? VIEW_TYPE_ICON.find(o => o.id === VIEW_DISPLAY_TYPE[view.viewType]).txt
                  : data.name}
                {isDevCustomView && ['ParameterSet'].includes(viewSetting) && (
                  <div className="Gray_75 Font13 mTop4 Normal">{_l('插件发布后将作为使用者的视图配置')}</div>
                )}
              </div>
              {(view.viewType === 0 ||
                (view.viewType === 2 && get(view, 'advancedSetting.hierarchyViewType') === '3')) &&
                viewSetting === 'Show' && (
                  <span className="Hand Font14 batchSetBtn" onClick={() => this.setState({ showBatch: true })}>
                    <Icon icon="format_paint" />
                    <span className="mLeft5 Normal">{_l('编辑列样式')}</span>
                  </span>
                )}
              {showBatch && (
                <BatchSet {...this.props} onClose={() => this.setState({ showBatch: false })} visible={showBatch} />
              )}
            </div>
          )}
          {this.renderSetting()}
        </div>
      );
    };

    return (
      <div className="viewSetBox">
        <SideNav
          {...this.props}
          viewSetting={viewSetting}
          formatColumnsListForControlsWithoutHide={this.formatColumnsListForControlsWithoutHide}
          onChangeType={viewSetting => {
            this.setState({ viewSetting });
          }}
        />
        {!['PluginSettings'].includes(viewSetting) ? (
          <ScrollView className="viewContent flex">{conRender()}</ScrollView>
        ) : (
          <div className="viewContent flex contentCon flexColumn">{conRender()}</div>
        )}
      </div>
    );
  }
}
