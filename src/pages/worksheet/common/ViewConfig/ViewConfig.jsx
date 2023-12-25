import React, { Component } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { fieldCanSort, getSortData, filterHidedControls } from 'src/pages/worksheet/util';
import { Icon, Tooltip, ScrollView, CheckBlock, Radio, Dropdown } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum';
import { formatValuesOfOriginConditions } from '../../common/WorkSheetFilter/util';
import { getIconByType } from 'src/pages/widgetConfig/util';
import CardAppearance from './CardAppearance';
import ActionSet from './components/customBtn/ActionSet';
import HierarchyViewSetting from './hierarchyViewSetting';
import SortConditions from './components/SortConditions';
import MobileSet from './components/mobileSet/MobileSet';
import CalendarSet from './components/calendarSet/index';
import GunterSet from './components/gunterSet/index';
import FastFilter from './components/fastFilter';
import RecordColor from './components/recordColor';
import NavGroup from './components/navGroup';
import Show from './components/Show';
import Controls from './components/Controls';
import './ViewConfig.less';
import { getAdvanceSetting } from 'src/util';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import {
  updateViewAdvancedSetting,
  CAN_NOT_AS_VIEW_SORT,
  NORMAL_SYSTEM_FIELDS_SORT,
  WORKFLOW_SYSTEM_FIELDS_SORT,
  formatAdvancedSettingByNavfilters,
} from 'src/pages/worksheet/common/ViewConfig/util';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget.js';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import _ from 'lodash';
import { viewTypeConfig, setList } from './config';
import UrlParams from './components/urlParams';
import DebugConfig from './components/DebugConfig';
import PluginSettings from './components/PluginSettings';
import SubmitConfig from './components/Submit';
import ParameterSet from './components/ParameterSet';
import SideNav from './components/SideNav';
import pluginAjax from 'src/api/plugin.js';
import SvgIcon from 'src/components/SvgIcon';
import ViewFilter from './components/Filter';

const SwitchStyle = styled.div`
  .switchText {
    margin-right: 6px;
    line-height: 24px;
  }
  .icon {
    vertical-align: middle;
    &-ic_toggle_on {
      color: #00c345;
    }
    &-ic_toggle_off {
      color: #bdbdbd;
    }
  }
  .w30 {
    width: 30px;
  }
`;

const formatSortingColumns = columns => {
  return columns
    .filter(item => {
      return fieldCanSort(item.type);
    })
    .map(item => {
      return {
        iconName: getIconByType(item.type),
        value: item.controlId,
        text: item.controlName,
        controltype: item.type,
        enumDefault: item.enumDefault,
      };
    });
};

@errorBoundary
class ViewConfigCon extends Component {
  constructor(props) {
    super(props);
    this.state = this.fill({ ...props, isInit: true });
  }

  componentDidMount() {
    const { worksheetId, appId, viewId, refreshFn } = this.props;
    if (viewId) {
      refreshFn(worksheetId, appId, viewId, '');
    }
  }
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.view.viewId !== this.props.view.viewId ||
      !_.isEqual(nextProps.view.moreSort, this.props.view.moreSort) ||
      !_.isEqual(nextProps.view.showControls, this.props.view.showControls) ||
      !_.isEqual(nextProps.view.controls, this.props.view.controls) ||
      !_.isEqual(nextProps.view.displayControls, this.props.view.displayControls)
    ) {
      this.setState(this.fill(nextProps, nextProps.view.viewId === this.props.view.viewId));
    }
  }
  fill = ({ columns, view, sheetSwitchPermit, isInit = false, viewConfigTab, setViewConfigTab }, isEqualViewId) => {
    const sortCid = view.sortCid || 'ctime';
    const sortingColumns = formatSortingColumns(columns);
    const sortType = view.sortType || this.getDefaultSortValue(sortCid, sortingColumns);
    const { showControlName = true, showControls = [], controls = [] } = view;
    const {
      customdisplay = '0',
      refreshtime = '0',
      showno = '1', //显示序号
      showquick = '1', //显示记录快捷方式
      showsummary = '1', //显示汇总行
      showvertical = '1', //显示垂直表格线
      alternatecolor = '0', //显示交替行颜色
      titlewrap = '0', //标题行文字换行
      fastedit = '1', //行内编辑
      enablerules, //启用业务规则
      sheettype = '0', //表格交互
    } = getAdvanceSetting(view); //'0':表格显示列与表单中的字段保持一致 '1':自定义显示列
    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
    const defaultSysSort = isShowWorkflowSys
      ? [...WORKFLOW_SYSTEM_FIELDS_SORT, ...NORMAL_SYSTEM_FIELDS_SORT]
      : NORMAL_SYSTEM_FIELDS_SORT;
    const syssort = getAdvanceSetting(view, 'syssort') || defaultSysSort.filter(o => !controls.includes(o));
    const sysids = getAdvanceSetting(view, 'sysids') || [];
    const customShowControls = getAdvanceSetting(view, 'customShowControls') || showControls || [];
    // sysids：显示的系统字段 syssort：系统字段顺序
    const config = {
      name: view.name,
      controls,
      rowHeight: view.rowHeight || 0,
      showControls: view.showControls,
      controlsSorts: view.controlsSorts,
      displayControls: view.displayControls,
      sortCid,
      sortType,
      moreSort: view.moreSort || [],
      customdisplay: customdisplay === '1' || showControls.length > 0 ? '1' : '0', // 是否配置自定义显示列
      refreshtime,
      showControlName, //显示字段名称
      sysids,
      syssort,
      showno,
      showquick,
      showsummary,
      showvertical,
      alternatecolor,
      titlewrap,
      fastedit,
      enablerules,
      sheettype,
      customShowControls,
    };
    let data = {
      sortingColumns,
      filter: { items: [] },
      ...config,
    };
    const isDevCustomView = (_.get(view, 'pluginInfo') || {}).source === 0; //是否可以开发状态的自定义视图
    // ViewId更改，更改viewSetting 排序，无需更改viewSetting
    if (!isEqualViewId) {
      if (!!viewConfigTab) {
        setViewConfigTab('');
      }
      return {
        ...data,
        viewSetting: !!viewConfigTab
          ? viewConfigTab
          : VIEW_DISPLAY_TYPE[view.viewType] === 'customize' && isDevCustomView
          ? 'PluginSettings'
          : 'Setting',
      };
    }

    return data;
  };
  getDefaultSortValue(sortCid, columns) {
    const newSortingColumns = columns || this.state.sortingColumns;
    const select = newSortingColumns.filter(item => item.value === sortCid)[0] || {};
    const data = getSortData(select.controltype);
    return data[0].value;
  }
  //字段的columns 排除系统字段 (拥有者除外,且拥有者排在第一个) 排除不显示的字段
  formatColumnsListForControls = columns => {
    let data = columns.filter(
      column => !ALL_SYS.includes(column.controlId) && (column.fieldPermission || '111')[0] === '1',
    );
    data = columns.filter(o => o.controlId === 'ownerid').concat(data.filter(o => o.controlId !== 'ownerid'));
    return data;
  };
  //字段的columns 排除系统字段 (拥有者除外,且拥有者排在第一个)
  formatColumnsListForControlsWithoutHide = columns => {
    let data = columns.filter(column => !ALL_SYS.includes(column.controlId));
    data = columns.filter(o => o.controlId === 'ownerid').concat(data.filter(o => o.controlId !== 'ownerid'));
    return data;
  };
  columnChange = ({ newShowControls, newControlSorts }, withoutHide) => {
    const { displayControls = [], showControls = [], sysids = [], syssort = [] } = this.state;
    let { columns } = this.props;
    columns = withoutHide
      ? this.formatColumnsListForControlsWithoutHide(columns)
      : this.formatColumnsListForControls(columns);
    const newColumns = columns.filter(item => !newShowControls.includes(item.controlId));
    const controls = newColumns.map(item => item.controlId);
    let data = {};
    if (controls.includes('ownerid')) {
      data = {
        sysids: sysids.filter(o => !controls.includes(o)),
        syssort: syssort.filter(o => !controls.includes(o)),
      };
    } else if (!syssort.includes('ownerid')) {
      data = {
        syssort: syssort.concat('ownerid'),
      };
    }
    this.setState(
      {
        controls,
        displayControls: displayControls.filter(o => !controls.includes(o)),
        showControls: showControls.filter(o => !controls.includes(o)),
        ...data,
      },
      () => {
        this.handleSave({ editAttrs: ['controls', 'displayControls', 'showControls', 'advancedSetting'] });
      },
    );
  };
  handleSave(objs) {
    const { editAttrs } = objs || {};
    const {
      name,
      controls,
      moreSort,
      sortCid,
      sortType,
      showControls,
      controlsSorts,
      rowHeight,
      customdisplay,
      refreshtime,
      displayControls,
      sysids,
      syssort,
      customShowControls,
    } = this.state;
    const { worksheetId, view, appId } = this.props;
    const config = {
      name,
      sortCid,
      sortType,
      moreSort,
      controls,
      rowHeight,
      showControls: customdisplay === '0' ? [] : showControls,
      controlsSorts,
      displayControls,
    };
    let data = {
      appId,
      worksheetId,
      ...view,
      ...config,
      advancedSetting: updateViewAdvancedSetting(view, {
        customdisplay,
        refreshtime,
        customShowControls: JSON.stringify(customShowControls || (view.advancedSetting || {}).customShowControls || []),
        sysids: JSON.stringify(sysids),
        syssort: JSON.stringify(syssort),
        ..._.pick(this.state, [
          'showno',
          'showquick',
          'showsummary',
          'showvertical',
          'alternatecolor',
          'titlewrap',
          'fastedit',
          'enablerules',
          'sheettype',
        ]),
      }),
    };
    if (!!editAttrs) {
      data = { ...data, editAttrs };
    }
    this.props.updateCurrentView(data);
  }

  onChangeSet = (key, value) => {
    this.setState(
      {
        [key]: value,
      },
      () => {
        this.handleSave({ editAttrs: ['advancedSetting'] });
      },
    );
  };

  renderViewSetting() {
    const { columns, view, sheetSwitchPermit } = this.props;
    const isDevCustomView = (_.get(view, 'pluginInfo') || {}).source === 0; //是否可以开发状态的自定义视图
    if (VIEW_DISPLAY_TYPE[view.viewType] === 'customize' && !isDevCustomView) {
      return <ParameterSet {...this.props} onChangeView={this.onChangeCustomView} />;
    }
    const { rowHeight, refreshtime = '0', fastedit = '0', sheettype = '0', enablerules = '' } = this.state;
    const viewTypeText = VIEW_DISPLAY_TYPE[view.viewType];
    const filteredColumns = filterHidedControls(columns, view.controls, false).filter(
      c => !!c.controlName && !_.includes([22, 10010, 43, 45, 49, 51], c.type),
    );
    // 画廊视图封面需要嵌入字段，其他配置过滤
    const coverColumns = filterHidedControls(columns, view.controls, false).filter(c => !!c.controlName);
    /* 多表关联层级视图 */
    const isRelateMultiSheetHierarchyView = viewTypeText === 'structure' && String(view.childType) === '2';
    const isCalendar = viewTypeText === 'calendar';

    return (
      <div className="viewConfigWrap">
        {/* 日历视图基本配置 */}
        {isCalendar && (
          <CalendarSet
            {...this.props}
            updateCurrentView={view => {
              this.props.updateCurrentView(
                Object.assign(view, {
                  filters: formatValuesOfOriginConditions(view.filters),
                }),
              );
            }}
          />
        )}
        {/* gunter视图基本配置 */}
        {viewTypeText === 'gunter' && (
          <GunterSet
            {...this.props}
            updateCurrentView={view => {
              this.props.updateCurrentView(
                Object.assign(view, {
                  filters: formatValuesOfOriginConditions(view.filters),
                }),
              );
            }}
          />
        )}
        {/* 层级，看板，画廊 ，非多表关联层级视图 */}
        {_.includes(['board', 'structure', 'gallery', 'detail'], viewTypeText) && !isRelateMultiSheetHierarchyView && (
          <div className="cardAppearanceWrap">
            <CardAppearance
              {..._.pick(this.props, [
                'appId',
                'view',
                'columns',
                'worksheetControls',
                'updateCurrentView',
                'currentSheetInfo',
                'searchRows',
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
          </div>
        )}
        {/* 多表关联层级视图 */}
        {isRelateMultiSheetHierarchyView && (
          <HierarchyViewSetting {...this.props} filteredColumns={filteredColumns} coverColumns={coverColumns} />
        )}
        {/* 表格的基本设置 */}
        {viewTypeText === 'sheet' && (
          <div className="dataSetting">
            <div className="commonConfigItem Font13 bold">{_l('行高')}</div>
            <div className="commonConfigItem mTop12 mBottom32">
              <CheckBlock
                data={[
                  { text: _l('紧凑'), value: 0 }, // 34
                  { text: _l('中等'), value: 1 }, // 50
                  { text: _l('高'), value: 2 }, // 70
                  { text: _l('超高'), value: 3 }, // 100
                ]}
                value={rowHeight}
                onChange={value => {
                  this.setState(
                    {
                      rowHeight: value,
                    },
                    () => {
                      this.handleSave({ editAttrs: ['rowHeight'] });
                    },
                  );
                }}
              />
            </div>
            <div className="commonConfigItem Font13 bold">{_l('显示设置')}</div>
            {setList.map(o => {
              let show = this.state[o.key] === '1';
              return (
                <div className="">
                  <SwitchStyle>
                    <Icon
                      icon={show ? 'ic_toggle_on' : 'ic_toggle_off'}
                      className="Font30 Hand"
                      onClick={() => {
                        this.onChangeSet(o.key, show ? '0' : '1');
                      }}
                    />
                    <div className="switchText InlineBlock Normal mLeft12 mTop8">{o.txt}</div>
                    {o.tips && (
                      <Tooltip text={<span>{o.tips}</span>} popupPlacement="top">
                        <i className="icon-help Font16 Gray_9e mLeft3 TxtMiddle" />
                      </Tooltip>
                    )}
                  </SwitchStyle>
                </div>
              );
            })}
            <div className="commonConfigItem Font13 bold mTop32">{_l('表格交互方式')}</div>
            <div className="mTop12">
              <Radio
                className=""
                text={_l('经典模式')}
                checked={sheettype === '0'}
                onClick={value => {
                  this.onChangeSet('sheettype', '0');
                }}
              />
              <div className="txt Gray_75 mTop8" style={{ marginLeft: '28px' }}>
                {_l('点整行打开记录')}
              </div>
            </div>
            <div className="mTop20">
              <Radio
                className=""
                text={_l('电子表格模式')}
                checked={sheettype === '1'}
                onClick={value => {
                  this.onChangeSet('sheettype', '1');
                }}
              />
              <div className="txt Gray_75 mTop8" style={{ marginLeft: '28px' }}>
                {_l('点单元格选中字段，按空格键打开记录')}
              </div>
            </div>
            <div className="commonConfigItem Font13 bold mTop32">{_l('更多设置')}</div>
            <SwitchStyle className="mTop12">
              <div className="flexRow alignItemsCenter">
                <Icon
                  icon={fastedit === '1' ? 'ic_toggle_on' : 'ic_toggle_off'}
                  className="Font30 Hand"
                  onClick={() => {
                    this.onChangeSet('fastedit', fastedit === '1' ? '0' : '1');
                  }}
                />

                <div className="switchText InlineBlock Normal mLeft12">{_l('允许行内编辑')}</div>
              </div>
              <div className="flexRow">
                <div className="w30" />
                <div className="switchText InlineBlock Normal mLeft12 Gray_75 mTop4">
                  {_l('无需打开记录详情，在表格行内直接编辑字段')}
                </div>
              </div>
            </SwitchStyle>
            <SwitchStyle className="mTop12">
              <div className="flexRow alignItemsCenter">
                <Icon
                  icon={enablerules === '1' || !enablerules ? 'ic_toggle_on' : 'ic_toggle_off'}
                  className="Font30 Hand"
                  onClick={() => {
                    this.onChangeSet('enablerules', enablerules === '1' || !enablerules ? '0' : '1');
                  }}
                />
                <div className="switchText InlineBlock Normal mLeft12">{_l('启用业务规则')}</div>
              </div>
              <div className="flexRow">
                <div className="w30"></div>
                <div className="switchText InlineBlock Normal mLeft12 Gray_75 mTop4">
                  {_l('在表格中生效业务规则，但会影响表格性能')}
                </div>
              </div>
            </SwitchStyle>
            <div className="commonConfigItem Font13 bold mTop32">{_l('自动刷新')}</div>
            <div className="Gray_9e mTop8 flex">{_l('每隔一段时间后自动刷新当前视图')}</div>
            <div className="commonConfigItem mTop12 mBottom32">
              <Dropdown
                className="w100"
                border
                value={refreshtime}
                data={[
                  {
                    text: _l('关闭'),
                    value: '0',
                  },
                  // {
                  //   text: _l('10秒'),
                  //   value: '10',
                  // },
                  {
                    text: _l('30秒'),
                    value: '30',
                  },
                  {
                    text: _l('1分钟'),
                    value: '60',
                  },
                  {
                    text: _l('2分钟'),
                    value: '120',
                  },
                  {
                    text: _l('3分钟'),
                    value: '180',
                  },
                  {
                    text: _l('4分钟'),
                    value: '240',
                  },
                  {
                    text: _l('5分钟'),
                    value: '300',
                  },
                ]}
                onChange={value => {
                  this.setState(
                    {
                      refreshtime: value,
                    },
                    () => {
                      this.handleSave({
                        editAttrs: ['advancedSetting'],
                      });
                    },
                  );
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  renderSort = () => {
    const { moreSort } = this.state;
    const { columns } = this.props;
    let columnsList = columns.filter(o => !CAN_NOT_AS_VIEW_SORT.includes(o.type));
    return (
      <div className="commonConfigItem">
        <SortConditions
          columns={columnsList}
          sortConditions={moreSort}
          onChange={value => {
            const first = value[0] || {};
            let data = {
              moreSort: value,
              sortCid: first.controlId || 'ctime',
              sortType: first.isAsc ? 2 : 1,
            };
            this.setState(
              {
                ...data,
              },
              () => {
                this.handleSave({ editAttrs: ['moreSort', 'sortCid', 'sortType'] });
              },
            );
          }}
        />
      </div>
    );
  };

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
    const { viewSetting, customdisplay = '0', customShowControls, showControls } = this.state;
    const {
      onShowCreateCustomBtn,
      worksheetId,
      appId,
      columns,
      view,
      refreshFn,
      btnList,
      viewId,
      sheetSwitchPermit,
      worksheetControls,
    } = this.props;

    const filteredColumns = filterHidedControls(columns, view.controls, false).filter(
      c => !!c.controlName && !_.includes([22, 10010, 43, 45, 49, 51], c.type),
    );

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
        return this.renderSort();
      case 'Controls': // 字段
        return (
          <Controls
            {...this.props}
            formatColumnsListForControls={this.formatColumnsListForControlsWithoutHide}
            columnChange={data => this.columnChange(data, true)}
          />
        );
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
        return (
          <Show
            {...this.props}
            info={this.state}
            onChange={type => {
              if (type === '0') {
                this.setState(
                  {
                    customdisplay: '0',
                    customShowControls: showControls,
                  },
                  () => {
                    this.handleSave({
                      editAttrs: ['showControls', 'advancedSetting'],
                    });
                  },
                );
              } else {
                this.setState(
                  {
                    customdisplay: '1',
                    showControls:
                      (customShowControls || []).length !== 0
                        ? customShowControls
                        : filteredColumns
                            .filter(l => l.controlId.length > 20)
                            .slice(0, 50)
                            .map(c => c.controlId),
                  },
                  () => {
                    this.handleSave({
                      editAttrs: ['showControls', 'advancedSetting'],
                    });
                  },
                );
              }
            }}
            onChangeColumns={({ newShowControls, newControlSorts }) => {
              if (customdisplay === '1') {
                this.setState(
                  {
                    showControls: newShowControls,
                    customShowControls: newShowControls,
                    customdisplay: '1',
                  },
                  () => {
                    this.handleSave({
                      editAttrs: ['showControls', 'advancedSetting'],
                    });
                  },
                );
              } else {
                this.setState(
                  {
                    sysids: newShowControls,
                    syssort: newControlSorts,
                  },
                  () => {
                    this.handleSave({
                      editAttrs: ['advancedSetting'],
                    });
                  },
                );
              }
            }}
          />
        );
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
      default:
        const isDevCustomView = (_.get(view, 'pluginInfo') || {}).source === 0; //是否可以开发状态的自定义视图
        if (VIEW_DISPLAY_TYPE[view.viewType] === 'customize' && isDevCustomView) {
          return <DebugConfig {...this.props} onChangeView={this.onChangeCustomView} />;
        }
        return this.renderViewSetting(); // 基础设置
    }
  };

  render() {
    const { viewSetting } = this.state;
    const data = viewTypeConfig.find((item, i) => item.type === viewSetting) || {};
    const conRender = () => {
      const { view } = this.props;
      const isDevCustomView = (_.get(view, 'pluginInfo') || {}).source === 0; //是否可以开发状态的自定义视图
      return (
        <div className={cx('viewContentCon', { H100: ['Submit', 'Filter'].includes(data.type) })}>
          {!['MobileSet', 'FastFilter', 'NavGroup', 'RecordColor', 'ActionSet', 'Submit', 'Filter'].includes(
            data.type,
          ) && (
            <div className="viewSetTitle">
              {data.type === 'Setting' ? _l('视图设置') : data.name}
              {isDevCustomView && ['ParameterSet'].includes(viewSetting) && (
                <div className="Gray_9e Font13 mTop4 Normal">{_l('插件发布后将作为使用者的视图配置')}</div>
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

@withClickAway
export default class ViewConfig extends React.Component {
  constructor(props) {
    super(props);
    const { view } = props;
    this.state = {
      name: view.name,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { view } = nextProps;
    if (nextProps.viewId !== this.props.viewId) {
      this.state = {
        name: view.name,
      };
    }
  }

  componentWillUnmount() {
    if (this.inputEl && document.activeElement === this.inputEl) {
      const value = this.inputEl.value.trim();
      if (value && this.props.view.name !== value) {
        this.handleNameSave();
      }
    }
  }

  handleNameSave() {
    const { name } = this.state;
    const { worksheetId, view, appId } = this.props;
    this.props.updateCurrentView({
      ...view,
      name,
      appId,
      worksheetId,
      editAttrs: ['name'],
    });
  }

  renderTitle() {
    const { name } = this.state;
    const { view } = this.props;
    const { icon, color } = VIEW_TYPE_ICON.find(it => it.id === VIEW_DISPLAY_TYPE[view.viewType]) || {};
    const isCustomize = ['customize'].includes(VIEW_DISPLAY_TYPE[view.viewType]);
    return (
      <div className="viewTitle">
        {isCustomize ? (
          <SvgIcon
            url={_.get(view, 'pluginInfo.iconUrl') || 'https://fp1.mingdaoyun.cn/customIcon/sys_12_4_puzzle.svg'}
            fill={_.get(view, 'pluginInfo.iconColor') || '#445A65'}
            size={18}
          />
        ) : (
          <Icon className="mRight5 Font20" style={{ color }} icon={icon} />
        )}
        <input
          autoFocus={view.isNewView}
          value={name}
          ref={inputEl => {
            this.inputEl = inputEl;
          }}
          onChange={event => {
            this.setState({
              name: event.target.value,
            });
          }}
          onFocus={() => {
            if (view.isNewView) {
              setTimeout(() => {
                $(this.inputEl).select();
              }, 0);
            }
          }}
          onBlur={event => {
            const value = event.target.value.trim();
            if (!value) {
              this.setState({
                name: view.name,
              });
            }
            if (value && view.name !== value) {
              this.handleNameSave();
            }
          }}
          onKeyDown={event => {
            const value = event.target.value.trim();
            if (event.which === 13 && value && view.name !== value) {
              this.handleNameSave();
              $(this.inputEl).blur();
            }
          }}
          className="Font16"
        />
        <Icon icon="close" className="Gray_9d Font20 pointer" onClick={this.props.onClose} />
      </div>
    );
  }
  render() {
    return (
      <div className="worksheetViewConfig">
        <div>
          {this.renderTitle()}
          <ViewConfigCon {...this.props} />
        </div>
      </div>
    );
  }
}
