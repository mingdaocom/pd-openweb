import React, { Component, Fragment } from 'react';
import { Dialog, Dropdown, Menu, MenuItem, LoadDiv, Tooltip, RadioGroup } from 'ming-ui';
import Trigger from 'rc-trigger';
import { SearchWorksheetWrap, WorksheetListWrap } from '../DynamicDefaultValue/styled';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import { handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import { checkConditionCanSave } from 'src/pages/FormSet/components/columnRules/config';
import SelectWorksheet from './SelectWorksheet';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import SelectControl from '../SelectControl';
import { getControls } from '../DynamicDefaultValue/util';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue';
import SortConditions from 'src/pages/worksheet/common/ViewConfig/components/SortConditions';
import { SYS_CONTROLS, FORM_HIDDEN_CONTROL_IDS } from 'src/pages/widgetConfig/config/widget.js';
import '../DynamicDefaultValue/inputTypes/SubSheet/style.less';
import cx from 'classnames';
import _ from 'lodash';

const rowControl = [{ controlId: 'rowid', type: 2, controlName: _l('记录ID') }];
const RadioDisplay = [
  {
    text: _l('获取第一条'),
    value: 0,
  },
  {
    text: _l('不获取'),
    value: 1,
  },
];

export const getDefaultCount = (data = {}, value = 0) => {
  value = parseInt(value);
  if (value) {
    // 下拉框50，卡片200，列表500
    if (data.type === 29 && _.get(data, 'advancedSetting.showtype') === '3') {
      value = value > 50 ? 50 : value;
    } else if (data.type === 29 && _.get(data, 'advancedSetting.showtype') === '1') {
      value = value > 200 ? 200 : value;
    } else if (value > 500) {
      value = 500;
    }
  } else {
    if (data.type === 29 && _.get(data, 'advancedSetting.showtype') === '3') {
      value = 50;
    } else if (data.type === 29 && _.get(data, 'advancedSetting.showtype') === '1') {
      value = 200;
    } else {
      value = 500;
    }
  }
  return value;
};

// 关联记录、子表等他表字段需要处理controls
const dealRelationControls = (controls = []) => {
  return controls.map((control = {}) => {
    if (control.type === 30) {
      const currentItemRelate = _.find(controls, c => (control.dataSource || '').includes(c.controlId)) || {};
      const currentItem = _.find(
        currentItemRelate.relationControls || [],
        r => r.controlId === control.sourceControlId,
      );
      return currentItem && _.includes([9, 10, 11], currentItem.type)
        ? { ...control, dataSource: currentItem.dataSource }
        : control;
    } else {
      return control;
    }
  });
};

export default class SearchWorksheetDialog extends Component {
  constructor(props) {
    super(props);
    const {
      data: { relationControls = [] },
    } = props;
    this.state = {
      id: '', //工作表查询配置id
      sheetList: [],
      originSheetList: [],
      appId: '', //应用id
      appName: '', //应用名
      sheetId: '', //工作表id
      sheetName: '', //表名
      isSheetDelete: false,
      controls: [],
      configs: [], //选择字段
      items: [],
      moreType: 0, // 获取第一条
      moreSort: [], // 排序
      queryCount: '', // 查询数量
      visible: false,
      showMenu: false,
      controlVisible: false,
      relationControls: relationControls,
      sheetSwitchPermit: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.getWorksheetList();
  }

  getWorksheetList = () => {
    const { globalSheetInfo = {}, dynamicData = {}, data = {}, queryConfig = {} } = this.props;
    const { id = '', sourceId = '', sourceName = '' } = dynamicData;
    if (!globalSheetInfo.appId) return null;
    homeAppAjax.getWorksheetsByAppId({ appId: globalSheetInfo.appId, type: 0 }).then(res => {
      const sheetList = (res || []).map(({ workSheetId: sheetId, workSheetName: sheetName }) => ({
        sheetId,
        sheetName,
      }));
      this.setState(
        {
          id,
          sheetList,
          originSheetList: sheetList,
          appId: globalSheetInfo.appId,
          sheetId: sourceId || (this.relateField() ? data.dataSource : ''),
          sheetName: this.relateField() ? data.sourceEntityName : '',
          controls: this.relateField() ? this.state.relationControls : [],
          loading: !!id,
        },
        () => {
          if (this.state.id) {
            this.setState({
              items: queryConfig.items,
              configs: queryConfig.configs,
              moreType: queryConfig.moreType || 0,
              moreSort: queryConfig.moreSort,
              queryCount: queryConfig.queryCount,
              controls: queryConfig.templates ? _.get(queryConfig.templates[0] || {}, 'controls') : [],
              sheetName: sourceName,
              isSheetDelete: !(_.get(queryConfig, 'templates[0].controls') || []).length,
              appName: queryConfig.appName,
              loading: false,
            });
          }
        },
      );
    });
  };

  relateField = () => {
    const { data = {} } = this.props;
    return _.includes([29], data.type);
  };

  setControls = () => {
    const { sheetId, appId } = this.state;
    if (!sheetId) return;
    worksheetAjax
      .getWorksheetInfo({ worksheetId: sheetId, getTemplate: true, getSwitchPermit: true, appId })
      .then(res => {
        const { controls = [] } = res.template || {};
        this.setState({
          controls: controls,
          sheetName: res.name,
          isSheetDelete: !controls.length,
          sheetSwitchPermit: res.switches,
        });
      });
  };

  renderSearchCom = () => {
    return (
      <span
        onClick={e => {
          if (!this.state.sheetId) {
            alert(_l('请选择工作表'), 3);
            return;
          }
        }}
      >
        <i className="icon icon-add"></i>
        {_l('查询条件')}
      </span>
    );
  };

  handleSubmit = () => {
    const { globalSheetInfo = {}, from, subListSheetId, data = {}, onChange, onClose, updateQueryConfigs } = this.props;
    const {
      id = '',
      sheetId,
      appId,
      sheetName,
      items = [],
      configs = [],
      controls = [],
      appName,
      moreSort,
      moreType,
      queryCount,
    } = this.state;
    const worksheetId = from === 'subList' ? subListSheetId : globalSheetInfo.worksheetId;
    const sourceType = from === 'subList' || worksheetId === sheetId ? 1 : 2;
    let params = {
      id: id && id.includes('-') ? '' : id,
      appId,
      worksheetId,
      controlId: data.controlId,
      sourceId: sheetId,
      sourceName: sheetName,
      sourceType,
      items,
      configs,
      moreType,
      moreSort,
      queryCount,
    };
    worksheetAjax.saveQuery(params).then(res => {
      const value = {
        id: res,
        sourceId: sheetId,
        sourceName: sheetName,
      };
      onChange(
        handleAdvancedSettingChange(data, {
          dynamicsrc: JSON.stringify(value),
          defaultfunc: '',
          defsource: JSON.stringify([]),
          defaulttype: '2',
        }),
      );
      updateQueryConfigs({ ...params, id: res, templates: [{ controls }], appName });
      onClose();
    });
  };

  handleSearch = _.throttle(value => {
    const { originSheetList = [] } = this.state;
    this.setState({
      sheetList: value ? originSheetList.filter(i => (i.sheetName || '').indexOf(value) > -1) : originSheetList,
    });
  }, 300);

  // 获取子表下拉数据或查询表下拉数据
  getDropData = (controls = [], control = {}, hasRowId) => {
    let filterControls = getControls({ data: control, controls, isCurrent: true, needFilter: true });
    filterControls = filterControls.filter(i => !_.includes(['wfftime', 'rowid'], i.controlId));
    // 有记录id选项(同查询表的关联记录或者文本类控件)
    if (hasRowId) {
      if ((control.type === 29 && control.dataSource === this.state.sheetId) || _.includes([2, 32], control.type))
        filterControls = rowControl.concat(filterControls);
    }
    return filterControls.map(({ controlId: value, controlName: text, dataSource }) => {
      if (_.includes([9, 10, 11], control.type) && dataSource && control.dataSource === dataSource) {
        return { text, value, isEqualSource: true };
      }
      return { text, value };
    });
  };

  // 过滤已经选中的映射字段
  filterSelectControls = (controls = []) => {
    const { configs = [] } = this.state;
    controls = controls.filter(i => !_.includes([...SYS_CONTROLS, ...FORM_HIDDEN_CONTROL_IDS], i.controlId));
    controls = controls.filter(co => {
      return (
        _.includes([2, 3, 4, 5, 6, 8, 9, 10, 11, 15, 16, 19, 23, 24, 26, 27, 28, 36, 46, 48], co.type) ||
        (co.type === 29 && (co.advancedSetting || {}).showtype !== '2')
      );
    });
    return controls.filter(i => !_.includes(configs.map(x => x.cid) || [], i.controlId));
  };

  renderMapping = () => {
    let { configs = [], controls = [], relationControls = [] } = this.state;
    return (
      <React.Fragment>
        <div className="mappingItem mBottom0">
          <div className="mappingTitle">{_l('子表')}</div>
          <div className="mappingTitle">{_l('查询表字段')}</div>
        </div>
        {configs.map((item, index) => {
          //已选择的子表字段
          const selectControl = _.find(relationControls, re => re.controlId === item.cid);
          // 根据选中子表字段匹配默认值规则，筛选可匹配的查询表字段
          const subControls = this.getDropData(controls, selectControl, true);
          // 查询表字段已删除
          const isDelete = item.subCid && !_.find(subControls, subControl => subControl.value === item.subCid);
          return (
            <div className="mappingItem">
              <div className="mappingControlName overflow_ellipsis">
                {_.get(selectControl, 'controlName') || (
                  <Tooltip text={<span>{_l('ID: %0', item.cid)}</span>} popupPlacement="bottom">
                    <span className="Red">{_l('字段已删除')}</span>
                  </Tooltip>
                )}
              </div>
              <span className="mLeft20 mRight20">=</span>
              <Dropdown
                className="mapppingDropdown"
                border
                isAppendToBody
                placeholder={
                  isDelete ? (
                    <Tooltip text={<span>{_l('ID: %0', item.subCid)}</span>} popupPlacement="bottom">
                      <span className="Red">{_l('字段已删除')}</span>
                    </Tooltip>
                  ) : (
                    _l('选择查询表字段')
                  )
                }
                value={isDelete ? undefined : item.subCid || undefined}
                data={subControls}
                onChange={controlId => {
                  const currentItem = _.find(subControls, subControl => subControl.value === controlId) || {};
                  this.setState({
                    configs: configs.map((i, idx) =>
                      idx === index ? Object.assign({}, i, { subCid: currentItem.value }) : i,
                    ),
                  });
                }}
              />
              <span
                className="mLeft15"
                onClick={() =>
                  this.setState({
                    configs: configs.filter((c, idx) => idx !== index),
                  })
                }
              >
                <i className="icon-delete1 Font17 Gray_9d ThemeHoverColor3"></i>
              </span>
            </div>
          );
        })}
      </React.Fragment>
    );
  };

  render() {
    const {
      sheetId,
      appName,
      sheetName,
      controls = [], //动态字段值显示的Controls
      configs = [],
      sheetList = [],
      items = [],
      relationControls = [],
      visible,
      showMenu,
      controlVisible,
      loading = false,
      isSheetDelete,
      moreType,
      moreSort,
      queryCount,
      sheetSwitchPermit,
    } = this.state;
    const { from, onClose, data = {}, globalSheetInfo = {}, allControls = [], queryControls = [] } = this.props;
    const totalControls = from === 'subList' ? queryControls : allControls;
    // 同源级联
    const selfCascader = data.type === 35 && data.dataSource === sheetId;
    //关联单条、多条（卡片、下拉框）
    const relateField = this.relateField();
    //空白子表、关联类型子表
    const subField = _.includes([34], data.type);
    //普通字段
    const normalField = !(selfCascader || relateField || subField);
    // 关联本表
    const selfRelate = selfCascader || relateField;

    const checkFilters = _.isEmpty(items) || !checkConditionCanSave(items, true);
    const checkConfigs = _.isEmpty(configs) || !_.every(configs, con => !!con.cid);
    const okDisabled = normalField
      ? !sheetId || checkFilters || _.isEmpty(configs)
      : selfRelate
      ? checkFilters
      : !sheetId || checkFilters || checkConfigs;

    const isDelete =
      _.get(configs[0] || {}, 'subCid') &&
      !_.find(controls, con => con.controlId === _.get(configs[0] || {}, 'subCid'));

    const filterItems = JSON.parse(JSON.stringify(items).replace(/"rcid":"parent"/g, '"rcid":""'));

    return (
      <Dialog
        visible={true}
        title={<span className="Bold">{_l('查询工作表')}</span>}
        width={640}
        onCancel={onClose}
        okDisabled={okDisabled}
        className="SearchWorksheetDialog"
        onOk={() => {
          this.handleSubmit();
        }}
      >
        {loading ? (
          <LoadDiv className="mTop10 TxtCenter" />
        ) : (
          <React.Fragment>
            <SearchWorksheetWrap>
              <SettingItem className="mTop8">
                <div className="settingItemTitle">{_l('工作表')}</div>
                <Trigger
                  action={['click']}
                  popupVisible={showMenu}
                  onPopupVisibleChange={showMenu => {
                    if (relateField) {
                      return;
                    }
                    this.setState({ showMenu });
                  }}
                  popupStyle={{ width: 592 }}
                  popup={() => {
                    return (
                      <WorksheetListWrap>
                        <Menu
                          fixedHeader={
                            <div
                              className="flexRow"
                              style={{
                                padding: '0 16px 0 14px',
                                height: 36,
                                alignItems: 'center',
                                borderBottom: '1px solid #e0e0e0',
                                marginBottom: 5,
                              }}
                            >
                              <i className="icon-search Gray_75 Font14" />
                              <input
                                type="text"
                                autoFocus
                                className="mLeft5 flex Border0 placeholderColor w100"
                                placeholder={_l('搜索')}
                                onChange={evt => this.handleSearch(evt.target.value.trim())}
                              />
                            </div>
                          }
                        >
                          {sheetList.length > 0 ? (
                            sheetList.map(item => {
                              return (
                                <MenuItem
                                  onClick={() => {
                                    if (item.sheetId === sheetId) return;
                                    this.setState(
                                      {
                                        sheetId: item.sheetId,
                                        items: [],
                                        configs: [],
                                        moreSort: [],
                                        moreType: 0,
                                        showMenu: false,
                                      },
                                      this.setControls,
                                    );
                                  }}
                                >
                                  {item.sheetName}
                                </MenuItem>
                              );
                            })
                          ) : (
                            <MenuItem className="Gray_9">{_l('暂无搜索结果')}</MenuItem>
                          )}
                        </Menu>
                        <div
                          className="otherWorksheet"
                          onClick={() => this.setState({ visible: true, showMenu: false })}
                        >
                          {_l('其他应用下的工作表')}
                        </div>
                      </WorksheetListWrap>
                    );
                  }}
                  popupAlign={{
                    points: ['tl', 'bl'],
                    offset: [0, 3],
                    overflow: {
                      adjustX: true,
                      adjustY: true,
                    },
                  }}
                >
                  <div className={cx('settingWorksheetInput', { disabled: relateField })} ref={con => (this.box = con)}>
                    <div className="overflow_ellipsis">
                      {sheetName ? (
                        <span className={cx(isSheetDelete ? 'Red' : 'Gray')}>
                          {isSheetDelete ? _l('工作表已删除') : sheetName}
                          {appName && <span>（{appName}）</span>}
                        </span>
                      ) : (
                        <span className="Gray_bd">{_l('选择工作表')}</span>
                      )}
                    </div>
                    <div className="edit">
                      <i className="icon-arrow-down-border"></i>
                    </div>
                  </div>
                </Trigger>
              </SettingItem>
              <SettingItem>
                <div className="settingItemTitle">{_l('查询条件')}</div>
                {sheetId ? (
                  <div className="searchWorksheetFilter">
                    <FilterConfig
                      canEdit
                      feOnly
                      version={sheetId}
                      projectId={globalSheetInfo.projectId}
                      appId={globalSheetInfo.appId}
                      columns={dealRelationControls(controls)}
                      conditions={filterItems}
                      sheetSwitchPermit={sheetSwitchPermit}
                      from="relateSheet"
                      filterResigned={false}
                      showCustom={true}
                      currentColumns={totalControls}
                      onConditionsChange={conditions => {
                        this.setState({ items: conditions });
                      }}
                    />
                  </div>
                ) : (
                  <div className="addFilterIcon pointer">{this.renderSearchCom()}</div>
                )}
              </SettingItem>

              {/**普通、关联单条、级联 */}
              {(normalField || (data.type === 29 && data.enumDefault === 1) || selfCascader) && (
                <SettingItem className="mTop12">
                  <div className="settingItemTitle">{_l('查询到多条时')}</div>
                  <RadioGroup
                    size="middle"
                    checkedValue={moreType}
                    data={RadioDisplay}
                    onChange={value => this.setState({ moreType: value })}
                  />
                </SettingItem>
              )}

              <SettingItem className="mTop12">
                <div className="settingItemTitle">{_l('排序规则')}</div>
                <SortConditions
                  className="searchWorksheetSort"
                  helperClass="zIndex99999"
                  columns={controls.filter(o => ![22, 43, 45, 49, 51, 52, 10010].includes(o.type))}
                  sortConditions={moreSort}
                  showSystemControls
                  onChange={value =>
                    this.setState({
                      moreSort: value.map(i => ({
                        ...i,
                        dataType: _.get(
                          _.find(controls, c => c.controlId === i.controlId),
                          'type',
                        ),
                      })),
                    })
                  }
                />
              </SettingItem>

              {/**关联多条、子表 */}
              {(data.type === 34 || (data.type === 29 && data.enumDefault === 2)) && (
                <SettingItem className="mTop12">
                  <div className="settingItemTitle">{_l('查询数量')}</div>
                  <InputValue
                    className="w100"
                    type={2}
                    placeholder={getDefaultCount(data)}
                    value={queryCount ? queryCount.toString() : undefined}
                    onChange={value => this.setState({ queryCount: value })}
                    onBlur={value => {
                      this.setState({ queryCount: getDefaultCount(data, value) });
                    }}
                  />
                </SettingItem>
              )}

              <SettingItem className="mTop12">
                <div className="settingItemTitle">{_l('赋值')}</div>
                {normalField && (
                  <Fragment>
                    <div>
                      {_l('将')}
                      <Dropdown
                        className="mLeft12 mRight12 Width250"
                        border
                        isAppendToBody
                        placeholder={
                          isDelete ? (
                            <Tooltip
                              text={<span>{_l('ID: %0', _.get(configs[0] || {}, 'subCid'))}</span>}
                              popupPlacement="bottom"
                            >
                              <span className="Red">{_l('字段已删除')}</span>
                            </Tooltip>
                          ) : (
                            _l('选择查询表字段')
                          )
                        }
                        disabled={!sheetId}
                        value={isDelete ? undefined : _.get(configs[0] || {}, 'subCid')}
                        data={this.getDropData(controls, data)}
                        renderItem={(selectData = {}) => {
                          return (
                            <span>
                              {selectData.text}
                              {selectData.isEqualSource && (
                                <span className="Gray_9e subText">（{_l('相同选项集')}）</span>
                              )}
                            </span>
                          );
                        }}
                        onChange={controlId => this.setState({ configs: [{ cid: data.controlId, subCid: controlId }] })}
                      />
                      {_l('的值写入当前字段')}
                    </div>
                  </Fragment>
                )}
                {selfRelate && <div>{_l('将获取到的记录写入到当前字段')}</div>}
                {subField && (
                  <div>
                    <div className="Gray_75 mBottom12">
                      {_l('查询到的每行记录添加为一行子表明细。请选择需要写入的字段。')}
                    </div>
                    {this.renderMapping()}
                    <Trigger
                      action={['click']}
                      popupVisible={controlVisible}
                      onPopupVisibleChange={controlVisible => {
                        if (!sheetId) {
                          return;
                        }
                        this.setState({ controlVisible });
                      }}
                      popupStyle={{ width: 280 }}
                      popup={
                        <SelectControl
                          list={this.filterSelectControls(relationControls)}
                          onClick={item => {
                            this.setState({
                              configs: this.state.configs.concat([{ cid: item.controlId, subCid: '' }]),
                            });
                          }}
                        />
                      }
                      popupAlign={{
                        points: ['tl', 'bl'],
                        offset: [0, 3],
                        overflow: {
                          adjustX: true,
                          adjustY: true,
                        },
                      }}
                    >
                      <div className="addFilterIcon pointer">
                        <span
                          onClick={() => {
                            if (!sheetId) {
                              alert(_l('请选择工作表'), 3);
                              return;
                            }
                          }}
                        >
                          <i className="icon icon-add"></i>
                          {_l('选择子表字段')}
                        </span>
                      </div>
                    </Trigger>
                  </div>
                )}
              </SettingItem>
              {visible && (
                <SelectWorksheet
                  {...this.props}
                  {...this.state}
                  onClose={() => this.setState({ visible: false })}
                  onOk={data => {
                    this.setState(
                      {
                        appId: data.appId,
                        appName: data.appName,
                        sheetId: data.sheetId,
                        items: data.sheetId === sheetId ? items : [],
                        configs: [],
                      },
                      this.setControls,
                    );
                  }}
                />
              )}
            </SearchWorksheetWrap>
          </React.Fragment>
        )}
      </Dialog>
    );
  }
}
