import React, { Component, Fragment } from 'react';
import { Dialog, Dropdown, Menu, MenuItem, LoadDiv, Tooltip } from 'ming-ui';
import Trigger from 'rc-trigger';
import { SearchWorksheetWrap, WorksheetListWrap } from '../DynamicDefaultValue/styled';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import { handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import SingleFilter from 'src/pages/worksheet/common/WorkSheetFilter/common/SingleFilter';
import { checkConditionCanSave } from 'src/pages/FormSet/components/columnRules/config';
import SelectWorksheet from './SelectWorksheet';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import SelectControl from '../SelectControl';
import { getControls } from '../DynamicDefaultValue/util';
import '../DynamicDefaultValue/inputTypes/SubSheet/style.less';
import cx from 'classnames';
import _ from 'lodash';

const rowControl = [{ controlId: 'rowid', type: 2, controlName: _l('记录ID') }];

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
      visible: false,
      showMenu: false,
      controlVisible: false,
      relationControls: relationControls,
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
    worksheetAjax.getWorksheetInfo({ worksheetId: sheetId, getTemplate: true, appId }).then(res => {
      const { controls = [] } = res.template || {};
      this.setState({ controls: controls, sheetName: res.name, isSheetDelete: !controls.length });
    });
  };

  renderSearchCom = () => {
    return (
      <React.Fragment>
        <i className="icon icon-add"></i>
        {_l('查询条件')}
      </React.Fragment>
    );
  };

  handleSubmit = () => {
    const { globalSheetInfo = {}, from, subListSheetId, data = {}, onChange, onClose, updateQueryConfigs } = this.props;
    const { id = '', sheetId, sheetName, items = [], configs = [], controls = [], appName } = this.state;
    const worksheetId = from === 'subList' ? subListSheetId : globalSheetInfo.worksheetId;
    const sourceType = from === 'subList' || worksheetId === sheetId ? 1 : 2;
    let params = {
      id: id && id.indexOf('new') > -1 ? '' : id,
      worksheetId,
      controlId: data.controlId,
      sourceId: sheetId,
      sourceName: sheetName,
      sourceType,
      items,
      configs,
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
    return filterControls.map(({ controlId: value, controlName: text }) => ({ text, value }));
  };

  // 过滤已经选中的映射字段
  filterSelectControls = (controls = []) => {
    const { configs = [] } = this.state;
    controls = controls.filter(i => !_.includes(['wfftime', 'rowid'], i.controlId));
    controls = controls.filter(co => {
      return (
        _.includes([2, 3, 4, 5, 6, 8, 15, 16, 19, 23, 24, 26, 27, 28, 36, 46, 48], co.type) ||
        (_.includes([9, 10, 11], co.type) && co.dataSource) ||
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
    } = this.state;
    const {
      from,
      onClose,
      data = {},
      globalSheetInfo = {},
      fromCondition, //筛选作用的控件
      allControls = [],
      queryControls = [],
    } = this.props;
    const totalControls = from === 'subList' ? queryControls : allControls;
    //普通字段
    const normalField = !_.includes([29, 34], data.type);
    //关联单条、多条（卡片、下拉框）
    const relateField = this.relateField();
    //空白子表、关联类型子表
    const subField = _.includes([34], data.type);

    const checkFilters = _.isEmpty(items) || !checkConditionCanSave(items);
    const checkConfigs = _.isEmpty(configs) || !_.every(configs, con => !!con.cid);
    const okDisabled = normalField
      ? !sheetId || checkFilters || _.isEmpty(configs)
      : relateField
      ? checkFilters
      : !sheetId || checkFilters || checkConfigs;

    const isDelete =
      _.get(configs[0] || {}, 'subCid') &&
      !_.find(controls, con => con.controlId === _.get(configs[0] || {}, 'subCid'));

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
                <div className="settingItemTitle">{relateField ? _l('从关联表') : _l('从工作表')}</div>
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
                                  onClick={() =>
                                    this.setState(
                                      {
                                        sheetId: item.sheetId,
                                        items: item.sheetId === sheetId ? items : [],
                                        configs: [],
                                        showMenu: false,
                                      },
                                      this.setControls,
                                    )
                                  }
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
                          {appName && <span>{_l('（%0）', appName)}</span>}
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
                <div className="settingItemTitle">{_l('查询满足以下条件的记录')}</div>
                {sheetId ? (
                  <SingleFilter
                    canEdit
                    feOnly
                    id={sheetId}
                    projectId={globalSheetInfo.projectId}
                    appId={globalSheetInfo.appId}
                    showSystemControls
                    columns={controls}
                    conditions={items}
                    from={fromCondition}
                    globalSheetControls={totalControls}
                    onConditionsChange={conditions => {
                      const newConditions = conditions.map(item => {
                        return item.isDynamicsource ? { ...item, values: [], value: '' } : item;
                      });
                      this.setState({ items: newConditions });
                    }}
                    comp={this.renderSearchCom}
                  />
                ) : (
                  <div className="addFilterCondition pointer">
                    <span
                      onClick={e => {
                        if (!sheetId) {
                          alert(_l('请选择工作表'), 3);
                          return;
                        }
                      }}
                    >
                      {this.renderSearchCom()}
                    </span>
                  </div>
                )}
              </SettingItem>
              <SettingItem className="mTop12">
                <div className="settingItemTitle">{_l('查询到记录后')}</div>
                {normalField && (
                  <Fragment>
                    <div className="Gray_75 mBottom12">{_l('如果查询到多条，取最新创建的一条')}</div>
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
                        onChange={controlId => this.setState({ configs: [{ cid: data.controlId, subCid: controlId }] })}
                      />
                      {_l('的值写入当前字段')}
                    </div>
                  </Fragment>
                )}
                {relateField && (
                  <div>
                    {_l(
                      '将查询到的%0记录关联到当前字段',
                      data.enumDefault === 1
                        ? _l('最新一条')
                        : _l('最多%0条', _.get(data.advancedSetting || {}, 'showtype') !== '2' ? 50 : 200),
                    )}
                  </div>
                )}
                {subField && (
                  <div>
                    <div className="Gray_75 mBottom12">
                      {_l('将查询到的最多200条记录字段写入子表字段，每行记录添加为一行子表明细')}
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
                      <div className="addFilterCondition pointer">
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
