import React, { Component, Fragment } from 'react';
import { Dialog, Dropdown, Menu, MenuItem, LoadDiv } from 'ming-ui';
import Trigger from 'rc-trigger';
import { SearchWorksheetWrap, WorksheetListWrap } from '../DynamicDefaultValue/styled';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';
import SingleFilter from 'src/pages/worksheet/common/WorkSheetFilter/common/SingleFilter';
import { checkConditionCanSave } from 'src/pages/FormSet/components/columnRules/config';
import SelectWorksheet from './SelectWorksheet';
import { getWorksheetsByAppId } from 'src/api/homeApp';
import { getWorksheetInfo, saveQuery } from 'src/api/worksheet';
import SelectControl from '../SelectControl';
import { getControls } from '../DynamicDefaultValue/util';
import { SYS } from 'src/pages/widgetConfig/config/widget';
import '../DynamicDefaultValue/inputTypes/SubSheet/style.less';
import cx from 'classnames';
import _ from 'lodash';

const HAS_DYNAMIC_DEFAULT_VALUE_CONTROL = [2, 3, 4, 5, 6, 8, 9, 10, 11, 15, 16, 19, 23, 24, 26, 27, 28, 29, 36];

const filterSys = (list = []) => {
  return list.filter(item => !_.includes(SYS, item.controlId));
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
      visible: false,
      showMenu: false,
      controlVisible: false,
      relationControls: filterSys(relationControls),
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
    getWorksheetsByAppId({ appId: globalSheetInfo.appId, type: 0 }).then(res => {
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
              controls: queryConfig.templates ? filterSys(_.get(queryConfig.templates[0] || {}, 'controls')) : [],
              sheetName: sourceName,
              isSheetDelete: !(queryConfig.templates || []).length,
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
    let { showtype } = getAdvanceSetting(data);
    return _.includes([29], data.type) && showtype !== '2';
  };

  setControls = () => {
    const { sheetId, appId } = this.state;
    if (!sheetId) return;
    getWorksheetInfo({ worksheetId: sheetId, getTemplate: true, appId }).then(res => {
      const { controls = [] } = res.template || {};
      this.setState({ controls: filterSys(controls), sheetName: res.name, isSheetDelete: !controls.length });
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

  getDropData = (list = []) => {
    return list.map(({ controlId: value, controlName: text }) => ({ text, value }));
  };

  handleSubmit = () => {
    const { globalSheetInfo = {}, data = {}, onChange, onClose, updateQueryConfigs } = this.props;
    const { id = '', sheetId, sheetName, items = [], configs = [], controls = [], appName } = this.state;
    const sourceType = globalSheetInfo.worksheetId === sheetId ? 1 : 2;
    let params = {
      id: id.indexOf('new') > -1 ? '' : id,
      worksheetId: globalSheetInfo.worksheetId,
      controlId: data.controlId,
      sourceId: sheetId,
      sourceName: sheetName,
      sourceType,
      items,
      configs,
    };
    saveQuery(params).then(res => {
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

  renderMapping = () => {
    let { configs = [], controls = [], relationControls = [] } = this.state;
    const getCurrent = id => {
      return _.find(controls, i => i.controlId === id) || {};
    };
    return (
      <React.Fragment>
        {configs.map((item, index) => {
          //过滤已经映射过的字段
          const filterIds = configs.filter(i => i.cid !== item.cid).map(x => x.cid);
          const filterControls = relationControls.filter(re => !_.includes(filterIds || [], re.controlId));
          //选择字段
          const selectControl = getCurrent(item.subCid);
          // 映射字段匹配动态默认值规则
          const subControls =
            getControls({ data: selectControl, controls: filterControls, isCurrent: true, fromSearch: 1 }) || [];
          const isDelete = item.cid && !_.find(subControls, subControl => subControl.controlId === item.cid);
          return (
            <div className="mappingItem">
              <div className="mappingControlName overflow_ellipsis">
                {selectControl.controlName || <span className="Red">{_l('字段已删除')}</span>}
              </div>
              <span className="mLeft20 mRight20">{_l('写入')}</span>
              <Dropdown
                className="mapppingDropdown"
                border
                isAppendToBody
                placeholder={isDelete ? <span className="Red">{_l('字段已删除')}</span> : _l('选择当前子表字段')}
                value={isDelete ? undefined : item.cid || undefined}
                data={this.getDropData(subControls)}
                onChange={controlId => {
                  const currentItem = _.find(subControls, subControl => subControl.controlId === controlId) || {};
                  this.setState({
                    configs: configs.map((i, idx) =>
                      idx === index ? Object.assign({}, i, { cid: currentItem.controlId }) : i,
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
      visible,
      showMenu,
      controlVisible,
      loading = false,
      isSheetDelete,
    } = this.state;
    const {
      onClose,
      data = {},
      globalSheetInfo = {},
      fromCondition, //筛选作用的控件
      allControls = [],
    } = this.props;
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

    const selectControls = controls
      .filter(({ type }) => _.includes(HAS_DYNAMIC_DEFAULT_VALUE_CONTROL, type))
      .filter(({ controlId }) => {
        const ids = configs.map(item => item.subCid);
        return !ids.includes(controlId);
      });

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
                                        items: [],
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
                    columns={controls}
                    conditions={items}
                    from={fromCondition}
                    globalSheetControls={allControls}
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
                          alert(_l('请选择工作表'));
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
                        placeholder={isDelete ? <span className="Red">{_l('字段已删除')}</span> : _l('选择查询表字段')}
                        disabled={!sheetId}
                        value={isDelete ? undefined : _.get(configs[0] || {}, 'subCid')}
                        data={this.getDropData(getControls({ data, controls, isCurrent: true, fromSearch: true }))}
                        onChange={controlId => this.setState({ configs: [{ cid: data.controlId, subCid: controlId }] })}
                      />
                      {_l('的值写入当前字段')}
                    </div>
                  </Fragment>
                )}
                {relateField && (
                  <div>
                    {_l('将查询到的%0记录关联到当前字段', data.enumDefault === 1 ? _l('最新一条') : _l('最多50条'))}
                  </div>
                )}
                {subField && (
                  <div>
                    <div className="Gray_75 mBottom12">
                      {_l('将查询到的最多50条记录字段写入子表字段，每行记录添加为一行子表明细')}
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
                          list={selectControls}
                          onClick={item => {
                            this.setState({
                              configs: this.state.configs.concat([{ cid: '', subCid: item.controlId }]),
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
                              alert(_l('请选择工作表'));
                              return;
                            }
                          }}
                        >
                          <i className="icon icon-add"></i>
                          {_l('选择查询表字段')}
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
                        items: [],
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
