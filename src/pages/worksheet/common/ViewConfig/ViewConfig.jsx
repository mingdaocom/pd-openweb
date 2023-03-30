import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { fieldCanSort, getSortData, filterHidedControls } from 'src/pages/worksheet/util';
import Trigger from 'rc-trigger';
import { Icon, Tooltip, ScrollView, Menu, MenuItem, CheckBlock, Radio, Dropdown } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import { VIEW_DISPLAY_TYPE, VIEW_TYPE_ICON } from 'src/pages/worksheet/constants/enum';
import sheetAjax from 'src/api/worksheet';
import { formatValuesOfOriginConditions } from '../../common/WorkSheetFilter/util';
import { getIconByType } from 'src/pages/widgetConfig/util';
import FilterConfig from '../../common/WorkSheetFilter/common/FilterConfig';
import CardAppearance from './CardAppearance';
import CustomBtn from './components/customBtn/CustomBtn';
import HierarchyViewSetting from './hierarchyViewSetting';
import SortConditions from './components/SortConditions';
import MobileSet from './components/mobileSet/MobileSet';
import CalendarSet from './components/calendarSet/index';
import GunterSet from './components/gunterSet/index';
import FastFilter from './components/fastFilter';
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
} from 'src/pages/worksheet/common/ViewConfig/util';
import { SYS, ALL_SYS, SYS_CONTROLS_WORKFLOW } from 'src/pages/widgetConfig/config/widget.js';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import _ from 'lodash';

const SysSortColumn = styled.div`
  .workSheetChangeColumn {
    .searchBar,
    .quickOperate {
      display: none;
    }
  }
  .showControlsColumnCheckItem {
    &:hover {
      background-color: initial;
    }
    padding: 0 0;
  }
`;
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
`;
const viewTypeConfig = [
  { type: 'Setting', name: _l('设置'), icon: '' }, // 设置
  { type: 'Show', name: _l('显示列'), icon: 'tune_new' }, // 显示列
  { type: 'Filter', name: _l('数据过滤'), icon: 'worksheet_filter' }, // 筛选
  { type: 'Sort', name: _l('排序'), icon: 'folder-sort' }, // 排序
  { type: 'Controls', name: _l('字段'), icon: 'visibility' }, // 字段
  { type: 'Color', name: _l('颜色'), icon: 'task-color' }, // 颜色
  { type: 'FastFilter', name: _l('快速筛选'), icon: 'smart_button_black_24dp' }, // 快速筛选
  { type: 'NavGroup', name: _l('筛选列表'), icon: 'list' }, // 快速筛选
  { type: 'CustomAction', name: _l('自定义动作'), icon: 'custom_actions' }, // 自定义动作
  { type: 'MobileSet', name: _l('移动端显示'), icon: 'phone' }, // 移动端设置
];
const viewTypeGroup = [
  { name: 'base', list: ['Setting', 'Show'] },
  { name: 'set', list: ['Filter', 'Sort', 'Controls'] },
  { name: 'action', list: ['FastFilter', 'NavGroup', 'CustomAction'] },
  { name: 'mobile', list: ['MobileSet'] },
];
const setList = [
  { key: 'showno', txt: _l('显示序号') },
  {
    key: 'showquick',
    txt: _l('显示记录快捷方式'),
    tips: _l('在记录前显示“更多”图标，点击后可以在下拉菜单中进行记录操作。'),
  },
  { key: 'showsummary', txt: _l('显示汇总行') },
  { key: 'showvertical', txt: _l('显示垂直表格线') },
  { key: 'alternatecolor', txt: _l('显示交替行颜色') },
  { key: 'titlewrap', txt: _l('标题行文字换行') },
];
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

const segmentation = columns => {
  for (let i = 0; i < columns.length; i++) {
    if (SYS.includes(columns[i].controlId)) {
      columns[i].segmentation = true;
      break;
    }
  }
  return columns;
};

const segmentationSortingColumns = columns => {
  for (let i = 0; i < columns.length; i++) {
    if (SYS.includes(columns[i].value)) {
      columns[i].type = 'hr';
      break;
    }
  }
  return columns;
};
@errorBoundary
class ViewConfigCon extends Component {
  constructor(props) {
    super(props);
    this.state = this.fill(props);
  }

  componentDidMount() {
    const { worksheetId, appId, viewId, refreshFn } = this.props;
    const { existingFilters } = this.state;
    if (viewId) {
      refreshFn(worksheetId, appId, viewId, '');
    }
    sheetAjax
      .getWorksheetFilters({ worksheetId })
      .then(data => {
        this.setState({
          existingFilters: existingFilters.concat(data),
        });
      })
      .fail(err => {
        alert(_l('获取筛选列表失败'), 2);
      });
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
  fill = ({ columns, view, sheetSwitchPermit }, isEqualViewId) => {
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
      sheettype = '0', //表格交互
    } = getAdvanceSetting(view); //'0':表格显示列与表单中的字段保持一致 '1':自定义显示列
    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
    const defaultSysSort = isShowWorkflowSys
      ? [...WORKFLOW_SYSTEM_FIELDS_SORT, ...NORMAL_SYSTEM_FIELDS_SORT]
      : NORMAL_SYSTEM_FIELDS_SORT;
    const syssort = getAdvanceSetting(view, 'syssort') || defaultSysSort.filter(o => !controls.includes(o));
    const sysids = getAdvanceSetting(view, 'sysids') || [];
    // sysids：显示的系统字段 syssort：系统字段顺序
    const config = {
      name: view.name,
      filters: view.filters || '',
      appearFilters: view.filters ? formatValuesOfOriginConditions(view.filters) : '',
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
      sheettype,
    };
    let data = {
      sortingColumns,
      existingFilters: [],
      filters: [],
      filter: { items: [] },
      shwoMoreMenu: false,
      ...config,
    };
    // ViewId更改，更改viewSetting 排序，无需更改viewSetting
    if (!isEqualViewId) {
      return {
        ...data,
        viewSetting: 'Setting',
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
  //字段的columns 排除系统字段 (拥有者除外,且拥有者排在第一个)
  formatColumnsListForControls = columns => {
    let data = columns.filter(
      column => !ALL_SYS.includes(column.controlId) && (column.fieldPermission || '111')[0] === '1',
    );
    data = columns.filter(o => o.controlId === 'ownerid').concat(data.filter(o => o.controlId !== 'ownerid'));
    return data;
  };
  columnChange = ({ newShowControls, newControlSorts }) => {
    const { displayControls = [], showControls = [], sysids = [], syssort = [] } = this.state;
    let { columns } = this.props;
    columns = this.formatColumnsListForControls(columns);
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
      appearFilters,
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
    } = this.state;
    const { worksheetId, view, appId } = this.props;
    const config = {
      name,
      filters: appearFilters,
      sortCid,
      sortType,
      moreSort,
      controls,
      rowHeight,
      showControls,
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
          'sheettype',
        ]),
      }),
    };
    if (!!editAttrs) {
      data = { ...data, editAttrs };
    }
    this.props.updateCurrentView(data);
  }

  renderViewBtns() {
    const { viewSetting } = this.state;
    const { btnData, view, columns, currentSheetInfo } = this.props;
    const { filters = [], controls = [], moreSort = [], fastFilters = [], groupFilters } = view;
    const { icon, text } = VIEW_TYPE_ICON.find(it => it.id === VIEW_DISPLAY_TYPE[view.viewType]) || {};
    const viewTypeText = VIEW_DISPLAY_TYPE[view.viewType];
    const columnsList = this.formatColumnsListForControls(columns);
    const controlsList = this.formatColumnsListForControls(controls);
    let daConfig = [
      {
        type: 'CustomAction',
        data: btnData,
      },
      {
        type: 'Filter',
        data: filters,
      },
      {
        type: 'FastFilter',
        data: fastFilters,
      },
    ];
    const getHtml = type => {
      let d = viewTypeConfig.find(o => o.type === type) || {};
      let da = (daConfig.find(o => o.type === type) || {}).data;
      if (type === 'FastFilter') {
        da = (da || []).filter(o => {
          if (!isOpenPermit(permitList.sysControlSwitch, currentSheetInfo.switches || [])) {
            return !SYS_CONTROLS_WORKFLOW.includes(o.controlId);
          } else {
            return true;
          }
        });
      }
      return (
        <span>
          <span className="titleTxt">{d.name}</span>
          {da.length > 0 && <span className="Gray_9e InlineBlock mLeft5 numText">{da.length}</span>}
        </span>
      );
    };
    let hideLengthStr = (
      <span>
        <span className="titleTxt">{_l('字段')}</span>
        {columnsList.length - controlsList.length > 0 && (
          <span className="Gray_9e InlineBlock mLeft5 numText">{`${columnsList.length - controlsList.length}/${
            columnsList.length
          }`}</span>
        )}
      </span>
    );
    // 多表关联层级视图
    const isRelateMultiSheetHierarchyView = viewTypeText === 'structure' && String(view.childType) === '2';
    return (
      <div className="viewBtns pTop7">
        {viewTypeGroup.map((it, i) => {
          // 只有表格有移动端设置
          if (viewTypeText !== 'sheet' && it.name === 'mobile') {
            return '';
          }
          return (
            <div className="viewBtnsLi">
              {it.list.map((o, n) => {
                let item = viewTypeConfig.find(d => d.type === o);
                if (
                  // 暂时不做颜色
                  item.type === 'Color' ||
                  //只有表格和画廊有快速筛选
                  (!['sheet', 'gallery'].includes(viewTypeText) && ['FastFilter', 'NavGroup'].includes(item.type)) ||
                  (!['sheet'].includes(viewTypeText) && o === 'Show') //只有表格有显示列
                ) {
                  return '';
                }
                return (
                  <React.Fragment>
                    {(item.type === 'MobileSet' ||
                      (['sheet', 'gallery'].includes(viewTypeText) && ['FastFilter', 'NavGroup'].includes(item.type)) ||
                      (!['sheet', 'gallery'].includes(viewTypeText) && item.type === 'CustomAction') ||
                      item.type === 'Filter') && (
                      <React.Fragment>
                        {item.type === 'Filter' ? (
                          <p className="titileP"> {_l('数据设置')}</p>
                        ) : (['sheet', 'gallery'].includes(viewTypeText) && item.type === 'FastFilter') ||
                          (!['sheet', 'gallery'].includes(viewTypeText) && item.type === 'CustomAction') ? (
                          <p className="titileP">{_l('用户操作')}</p>
                        ) : (
                          ''
                        )}
                      </React.Fragment>
                    )}
                    <div
                      className={cx('viewBtn', { active: viewSetting === item.type })}
                      onClick={() => {
                        this.setState({ viewSetting: item.type });
                      }}
                    >
                      <Icon className="mRight15 Font18 icon" icon={item.icon || icon} />
                      <span className="fontText">
                        {it.name === 'base' && o === 'Setting'
                          ? _l('%0设置', text)
                          : ['CustomAction', 'Filter', 'FastFilter'].includes(item.type)
                          ? getHtml(item.type)
                          : item.type === 'Controls'
                          ? hideLengthStr
                          : item.name}
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
              {/* 多表关联层级视图 =》筛选、排序、字段的设置仅作用于本表（第一层级）中的记录。 */}
              {isRelateMultiSheetHierarchyView && it.name === 'action' && (
                <div
                  className="Font13 pTop16 pBottom16 pLeft12 pRight12 mTop8 descCon"
                  style={{
                    color: '#8E8E8E',
                    backgroundColor: '#EDEDED',
                    borderRadius: '3px',
                  }}
                >
                  {_l('筛选、排序、字段的设置仅作用于本表（第一层级）中的记录。')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
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
    const { rowHeight, refreshtime = '0', fastedit = '0', sheettype = '0' } = this.state;
    const { columns, view, sheetSwitchPermit } = this.props;
    const viewTypeText = VIEW_DISPLAY_TYPE[view.viewType];
    const filteredColumns = filterHidedControls(columns, view.controls, false).filter(
      c => !!c.controlName && !_.includes([22, 10010, 43, 45, 49], c.type),
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
        {_.includes(['board', 'structure', 'gallery'], viewTypeText) && !isRelateMultiSheetHierarchyView && (
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
        {isRelateMultiSheetHierarchyView && <HierarchyViewSetting {...this.props} filteredColumns={filteredColumns} />}
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
            <div className="commonConfigItem Font13 bold mTop32">{_l('行内编辑')}</div>
            <SwitchStyle className="flexRow mTop12">
              <Icon
                icon={fastedit === '1' ? 'ic_toggle_on' : 'ic_toggle_off'}
                className="Font30 Hand"
                onClick={() => {
                  this.onChangeSet('fastedit', fastedit === '1' ? '0' : '1');
                }}
              />
              <div className="flex mTop4">
                <div className="switchText InlineBlock Normal mLeft12">{_l('允许行内编辑')}</div>
                <div className="switchText InlineBlock Normal mLeft12 Gray_75 mTop4">
                  {_l('无需打开记录详情，在表格行内直接编辑字段')}
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

  renderFilter = () => {
    const { existingFilters } = this.state;
    const { columns, view, projectId, appId, sheetSwitchPermit } = this.props;
    return (
      <Fragment>
        <div className="flexRow commonConfigItem">
          <div className="Gray_9e mTop8 flex">{_l('添加筛选条件，限制出现在此视图中的记录')}</div>
          {existingFilters.length ? (
            <Trigger
              popupVisible={this.state.shwoMoreMenu}
              onPopupVisibleChange={shwoMoreMenu => {
                this.setState({ shwoMoreMenu });
              }}
              popupClassName="DropdownPanelTrigger"
              action={['click']}
              popupAlign={{
                points: ['tl', 'bl'],
                offset: [-140, 0],
              }}
              popup={
                <Menu>
                  {existingFilters.map(({ filterId, name, items }, index) => (
                    <MenuItem
                      onClick={() => {
                        this.setState(
                          {
                            filters: items,
                            appearFilters: items,
                            shwoMoreMenu: false,
                          },
                          () => {
                            this.handleSave({ editAttrs: ['filters'] });
                          },
                        );
                      }}
                      key={filterId}
                    >
                      <span className="text">{name || _l('未命名筛选器 %0', index + 1)}</span>
                    </MenuItem>
                  ))}
                </Menu>
              }
            >
              <Tooltip
                disable={this.state.shwoMoreMenu}
                popupPlacement="bottom"
                text={<span>{_l('已保存的筛选器')}</span>}
              >
                <div className="valignWrapper more pointer">
                  <span>{_l('更多')}</span>
                  <Icon icon="arrow-down" />
                </div>
              </Tooltip>
            </Trigger>
          ) : null}
        </div>
        <FilterConfig
          version={view.filters && JSON.stringify(view.filters)}
          supportGroup
          canEdit
          feOnly
          filterColumnClassName="sheetViewFilterColumnOption"
          projectId={projectId}
          appId={appId}
          viewId={view.viewId}
          sheetSwitchPermit={sheetSwitchPermit}
          filterResigned={false}
          columns={segmentation(columns)}
          conditions={view.filters}
          onConditionsChange={conditions => {
            this.setState(
              {
                appearFilters: conditions,
              },
              () => {
                this.handleSave({ editAttrs: ['filters'] });
              },
            );
          }}
        />
      </Fragment>
    );
  };

  renderSort = () => {
    const { moreSort } = this.state;
    const { columns } = this.props;
    const { view } = this.props;
    const { begindate = '' } = getAdvanceSetting(view);
    let useSortListByTimeView = ['gunter', 'calendar'].includes(VIEW_DISPLAY_TYPE[view.viewType]);
    let columnsList = columns.filter(o => !CAN_NOT_AS_VIEW_SORT.includes(o.type));
    let isUnableBegindate = begindate && columns.find(o => o.controlId === begindate);
    return (
      <div className="commonConfigItem">
        <SortConditions
          columns={
            ///甘特图 默认排序方式：第一排序：视图中设置的开始时间字段，最旧的在前，第二排序：创建时间，最新的在前
            useSortListByTimeView
              ? [
                  {
                    controlId: 'ctime',
                    controlName: _l('创建时间'),
                    type: 16,
                  },
                ].concat(columnsList)
              : columnsList
          }
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

  renderSetting = () => {
    const { viewSetting, customdisplay = '0' } = this.state;
    const {
      showCreateCustomBtnFn,
      worksheetId,
      appId,
      columns,
      view,
      btnData,
      refreshFn,
      btnList,
      viewId,
      sheetSwitchPermit,
    } = this.props;

    const filteredColumns = filterHidedControls(columns, view.controls, false).filter(
      c => !!c.controlName && !_.includes([22, 10010, 43, 45, 49], c.type),
    );

    const customizeColumns = isShowWorkflowSys
      ? filteredColumns
      : filteredColumns.filter(c => !_.includes(WORKFLOW_SYSTEM_FIELDS_SORT, c.controlId));

    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
    const { hidebtn } = getAdvanceSetting(view); //隐藏不可用按钮 1：隐藏 0或者空：不隐藏
    switch (viewSetting) {
      case 'CustomAction': // 自定义动作
        return (
          <CustomBtn
            showCreateCustomBtnFn={showCreateCustomBtnFn}
            worksheetId={worksheetId}
            appId={appId}
            viewId={view.viewId}
            btnData={btnData}
            refreshFn={refreshFn}
            btnList={btnList}
            hidebtn={hidebtn} //是否隐藏无用按钮
            hidebtnFn={hidebtn => {
              this.props.updateCurrentView(
                Object.assign(view, {
                  advancedSetting: updateViewAdvancedSetting(view, {
                    hidebtn,
                  }),
                  editAttrs: ['advancedSetting'],
                }),
              );
            }}
          />
        );
      case 'Filter': // 筛选
        return this.renderFilter();
      case 'Sort': // 排序
        return this.renderSort();
      case 'Controls': // 字段
        return (
          <Controls
            {...this.props}
            formatColumnsListForControls={this.formatColumnsListForControls}
            columnChange={this.columnChange}
          />
        );
      case 'Color': // 颜色
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
                    showControls: [],
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
                    showControls: filteredColumns
                      .slice(0)
                      .sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1))
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
                    showControls: _.uniqBy(
                      newShowControls.concat(
                        customizeColumns.filter(c => (c.fieldPermission || '111')[0] === '0').map(c => c.controlId),
                      ),
                    ),
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
      default:
        return this.renderViewSetting(); // 基础设置
    }
  };

  render() {
    const { viewSetting } = this.state;
    const { view } = this.props;
    const { text } = VIEW_TYPE_ICON.find(it => it.id === VIEW_DISPLAY_TYPE[view.viewType]) || {};
    const data = viewTypeConfig.find((item, i) => item.type === viewSetting) || {};
    return (
      <div className="viewSetBox">
        {this.renderViewBtns()}
        <ScrollView className="viewContent flex">
          <div className="viewContentCon">
            {!['MobileSet', 'FastFilter', 'NavGroup'].includes(data.type) && (
              <div className="viewSetTitle">{data.type === 'Setting' ? _l('%0设置', text) : data.name}</div>
            )}
            {this.renderSetting()}
          </div>
        </ScrollView>
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
    return (
      <div className="viewTitle">
        <Icon className="mRight5 Font20" style={{ color }} icon={icon} />
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
