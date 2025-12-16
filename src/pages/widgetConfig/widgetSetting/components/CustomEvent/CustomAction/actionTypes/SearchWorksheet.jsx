import React, { Component, Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import update from 'immutability-helper';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Dialog, Dropdown, LoadDiv, Menu, MenuItem, RadioGroup } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import homeAppAjax from 'src/api/homeApp';
import worksheetAjax from 'src/api/worksheet';
import { checkConditionCanSave } from 'src/pages/FormSet/components/columnRules/config';
import { ROW_ID_CONTROL } from 'src/pages/widgetConfig/config/widget.js';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import 'src/pages/widgetConfig/styled/style.less';
import { isSheetDisplay } from 'src/pages/widgetConfig/util';
import SortConditions from 'src/pages/worksheet/common/ViewConfig/components/SortConditions';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import { redefineComplexControl } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { DYNAMIC_FROM_MODE } from '../../../DynamicDefaultValue/config';
import { SearchWorksheetWrap, WorksheetListWrap } from '../../../DynamicDefaultValue/styled';
import { getControls } from '../../../DynamicDefaultValue/util';
import EmptyRuleConfig from '../../../EmptyRuleConfig';
import SelectWorksheet from '../../../SearchWorksheet/SelectWorksheet';
import SelectControl from '../../../SelectControl';

const RadioDisplay = [
  {
    text: _l('获取第一条'),
    value: 0,
  },
  {
    text: _l('赋空值'),
    value: 2,
  },
  {
    text: _l('保留原值'),
    value: 1,
  },
];

const EmptyDisplay = [
  {
    text: _l('赋空值'),
    value: 0,
  },
  {
    text: _l('保留原值'),
    value: 1,
  },
];

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

class SearchWorksheetActionDialog extends Component {
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
      recordsNotFound: 0, // 赋空值
      resultType: 0, // 结果条件成立时
      moreSort: [], // 排序
      queryCount: '', // 查询数量
      visible: false,
      showMenu: false,
      controlVisible: false,
      childVisible: false,
      relationControls: relationControls,
      sheetSwitchPermit: [],
      views: [],
      loading: true,
      emptyRule: '',
    };
  }

  componentDidMount() {
    this.setValue();
  }

  setValue() {
    const { globalSheetInfo = {}, dynamicData = {}, queryConfig = {} } = this.props;

    let stateParams = {
      appId: globalSheetInfo.appId,
      appName: globalSheetInfo.appName,
      sheetId: '',
      sheetName: '',
      controls: [],
      sheetSwitchPermit: [],
      views: [],
    };

    if (dynamicData.id) {
      const tempControls = _.get(queryConfig, ['templates', 0, 'controls']) || [];
      const isDelete = !tempControls.length;
      stateParams = {
        ...stateParams,
        id: queryConfig.id,
        items: queryConfig.items,
        configs: queryConfig.configs,
        moreType: queryConfig.moreType || 0,
        recordsNotFound: queryConfig.recordsNotFound || 0,
        moreSort: queryConfig.moreSort,
        controls: tempControls,
        sheetId: queryConfig.sourceId,
        sheetName: queryConfig.sourceName,
        isSheetDelete: isDelete,
        appName: queryConfig.appName,
      };
    }

    this.setState({
      ...stateParams,
    });
  }

  getWorksheetList = () => {
    const { globalSheetInfo = {} } = this.props;
    if (!globalSheetInfo.appId) return;
    if (!_.isEmpty(this.state.originSheetList)) return;
    this.setState({ loading: true });
    homeAppAjax.getWorksheetsByAppId({ appId: globalSheetInfo.appId, type: 0 }).then(res => {
      const sheetList = (res || []).map(({ workSheetId: sheetId, workSheetName: sheetName }) => ({
        sheetId,
        sheetName,
      }));
      this.setState({
        sheetList,
        originSheetList: sheetList,
        loading: false,
      });
    });
  };

  setControls = () => {
    const { sheetId, appId } = this.state;
    if (!sheetId) return;
    worksheetAjax
      .getWorksheetInfo({ worksheetId: sheetId, getTemplate: true, getSwitchPermit: true, appId, getViews: true })
      .then(res => {
        const { controls = [] } = res.template || {};
        this.setState({
          controls: controls,
          sheetName: res.name,
          isSheetDelete: !controls.length,
          sheetSwitchPermit: res.switches,
          views: res.views,
          appName: res.appName,
        });
      });
  };

  handleSubmit = () => {
    const { globalSheetInfo = {}, data = {}, handleChange, onClose, updateQueryConfigs } = this.props;
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
      recordsNotFound,
      emptyRule,
    } = this.state;
    const sourceType = globalSheetInfo.worksheetId === sheetId ? 1 : 2;
    let params = {
      id: id && id.includes('-') ? '' : id,
      appId,
      worksheetId: globalSheetInfo.worksheetId,
      controlId: data.controlId,
      sourceId: sheetId,
      sourceName: sheetName,
      sourceType,
      items: items.map(i => {
        if (i.isGroup) {
          return { ...i, groupFilters: (i.groupFilters || []).map(g => ({ ...g, emptyRule })) };
        }
        return { ...i, emptyRule };
      }),
      configs,
      moreType,
      recordsNotFound,
      moreSort,
      eventType: 1,
    };
    worksheetAjax.saveQuery(params).then(res => {
      const value = {
        id: res.id,
        sourceId: sheetId,
      };
      handleChange(value);
      updateQueryConfigs({ ...params, ...value, templates: [{ controls }], appName });
      onClose();
    });
  };

  handleSearch = _.throttle(value => {
    const { originSheetList = [] } = this.state;
    this.setState({
      sheetList: value ? originSheetList.filter(i => (i.sheetName || '').indexOf(value) > -1) : originSheetList,
    });
  }, 300);

  // 获取查询表映射数据
  getDropData = (controls = [], control = {}, hasRowId) => {
    const { configs = [] } = this.state;
    controls = controls.filter(
      a =>
        !_.find(configs, c => c.subCid === a.controlId && c.cid !== control.controlId) &&
        !_.includes(['wfftime', 'rowid'], a.controlId),
    );
    if (control.type === 34) {
      return controls
        .filter(i => i.type === 34)
        .map(({ controlId: value, controlName: text }) => {
          return { text, value };
        });
    }
    let filterControls = getControls({
      data: control,
      controls,
      isCurrent: true,
      from: DYNAMIC_FROM_MODE.SEARCH_WORKSHEET,
    });
    // 有记录id选项(同查询表的关联记录或者文本类控件)
    if (
      hasRowId &&
      filterControls.length > 0 &&
      ((control.type === 29 && control.dataSource === this.state.sheetId) || _.includes([2, 32], control.type))
    ) {
      filterControls = ROW_ID_CONTROL.concat(filterControls);
    }
    return filterControls.map(({ controlId: value, controlName: text }) => {
      return { text, value };
    });
  };

  // 过滤已经选中的本表字段
  filterSelectControls = controls => {
    const { allControls = [] } = this.props;
    const { configs = [] } = this.state;
    controls = (controls || allControls).filter(a => !_.find(configs, c => c.cid === a.controlId));
    return controls.filter(co => {
      return (
        _.includes(
          [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 19, 23, 24, 26, 27, 28, 34, 35, 36, 40, 41, 46, 48],
          co.type,
        ) ||
        (co.type === 29 && !isSheetDisplay(co))
      );
    });
  };

  renderMappingItem = (item, index) => {
    const { allControls = [] } = this.props;
    const { controls = [], configs = [], childVisible } = this.state;
    const { cid, subCid, pid } = item;

    // 本表字段
    let cidControls = [].concat(allControls);
    if (pid) {
      const parentControl = _.find(allControls, a => a.controlId === pid) || {};
      cidControls = (parentControl.relationControls || []).filter(
        r => r.type !== 34 && _.includes(parentControl.showControls || [], r.controlId),
      );
    }
    const cidControl = _.find(cidControls, c => c.controlId === cid);
    const curIsSubList = _.get(cidControl, 'type') === 34;
    if (curIsSubList) {
      const { relationControls = [], showControls = [] } = cidControl;
      cidControls = relationControls.filter(r => _.includes(showControls, r.controlId));
    }

    const showSelect = (curIsSubList || pid) && !_.get(configs[index + 1], 'pid');

    // 查询表字段
    let subCidControl = _.find(controls, c => c.controlId === subCid);
    let subCidControls = [].concat(controls);
    if (pid) {
      const pidMapId = _.get(
        _.find(configs, c => c.cid === pid),
        'subCid',
      );
      const pidMapControl = _.find(controls, c => c.controlId === pidMapId) || {};
      subCidControls = (pidMapControl.relationControls || []).filter(
        i => i.type !== 34 && _.includes(pidMapControl.showControls || [], i.controlId),
      );
      subCidControl = _.find(subCidControls, s => s.controlId === subCid);
    }
    const isSubCidDelete = subCid && !subCidControl && subCid !== 'rowid';

    return (
      <Fragment>
        <div className="mappingItem">
          <div className={cx('mappingControlName overflow_ellipsis', { mLeft20: pid })}>
            {_.get(cidControl, 'controlName') || (
              <Tooltip title={_l('ID: %0', cid)} placement="bottom">
                <span className="Red">{_l('字段已删除')}</span>
              </Tooltip>
            )}
          </div>
          <span className="mLeft20 mRight20">=</span>
          <Dropdown
            className={cx('mapppingDropdown', { pLeft20: pid })}
            border
            isAppendToBody
            cancelAble
            placeholder={
              isSubCidDelete ? (
                <Tooltip title={_l('ID: %0', subCid)} placement="bottom">
                  <span className="Red">{_l('字段已删除')}</span>
                </Tooltip>
              ) : (
                _l('选择查询表字段')
              )
            }
            value={isSubCidDelete ? undefined : subCid || undefined}
            data={this.getDropData(subCidControls, cidControl, pid)}
            onChange={controlId => {
              let newConfigs = configs.map((i, idx) => (idx === index ? { ...i, subCid: controlId } : i));
              if (curIsSubList) {
                newConfigs = newConfigs.map(i => (i.pid === cid ? { ...i, subCid: '' } : i));
              }
              this.setState({
                configs: newConfigs,
              });
            }}
          />
          <span
            className="mLeft15"
            onClick={() => {
              let filterConfigs = configs.filter(c => c.cid !== cid);
              if (curIsSubList) {
                filterConfigs = filterConfigs.filter(c => !(c.pid === cid));
              }
              this.setState({
                configs: filterConfigs,
              });
            }}
          >
            <i className="icon-trash Font17 Gray_9d ThemeHoverColor3"></i>
          </span>
        </div>
        {showSelect && (
          <Trigger
            action={['click']}
            popupVisible={childVisible}
            onPopupVisibleChange={childVisible => {
              this.setState({ childVisible });
            }}
            popupStyle={{ width: 280 }}
            popup={
              <SelectControl
                list={this.filterSelectControls(cidControls)}
                onClick={item => {
                  this.setState({
                    configs: update(this.state.configs, {
                      $splice: [
                        [
                          index + 1,
                          0,
                          { cid: item.controlId, subCid: '', pid: pid || _.get(cidControl, 'controlId') || '' },
                        ],
                      ],
                    }),
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
            <div className="addFilterIcon pointer mLeft20 mBottom10">
              <span>
                <i className="icon icon-plus mRight8"></i>
                {_l('选择子表字段')}
              </span>
            </div>
          </Trigger>
        )}
      </Fragment>
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
      loading = false,
      isSheetDelete,
      moreType,
      recordsNotFound,
      moreSort,
      sheetSwitchPermit,
      views = [],
      controlVisible,
    } = this.state;
    const { onClose, globalSheetInfo = {}, allControls = [] } = this.props;
    const totalControls = allControls.map(redefineComplexControl);
    const viewId = _.get(views, '0.viewId');

    const checkFilters = _.isEmpty(items) || !checkConditionCanSave(items);
    const checkConfigs = _.isEmpty(configs) || !_.every(configs, con => !!(con.cid && con.subCid));
    const okDisabled = !sheetId || checkFilters || checkConfigs;

    const filterItems = JSON.parse(JSON.stringify(items).replace(/"rcid":"parent"/g, '"rcid":""'));

    return (
      <Dialog
        visible={true}
        title={_l('查询工作表')}
        width={640}
        overlayClosable={false}
        onCancel={onClose}
        okDisabled={okDisabled}
        className="SearchWorksheetDialog"
        onOk={() => {
          this.handleSubmit();
        }}
      >
        <SearchWorksheetWrap>
          <SettingItem className="mTop8">
            <div className="settingItemTitle">{_l('工作表')}</div>
            <Trigger
              action={['click']}
              popupVisible={showMenu}
              onPopupVisibleChange={showMenu => {
                this.setState({ showMenu }, () => {
                  if (showMenu) {
                    this.getWorksheetList();
                  }
                });
              }}
              popupStyle={{ width: 592 }}
              popup={() => {
                return (
                  <Fragment>
                    {loading ? (
                      <WorksheetListWrap>
                        <LoadDiv className="mTop10 mBottom10 TxtCenter" />
                      </WorksheetListWrap>
                    ) : (
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
                                        recordsNotFound: 0,
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
                          <div className="otherMenuItem">{_l('其他应用下的工作表')}</div>
                        </div>
                      </WorksheetListWrap>
                    )}
                  </Fragment>
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
              <div className="settingWorksheetInput" ref={con => (this.box = con)}>
                <div className="overflow_ellipsis">
                  {isSheetDelete ? (
                    <span className="Red">{_l('工作表已删除')}</span>
                  ) : sheetName ? (
                    <span className="Gray">
                      {sheetName}
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
            <div className="searchWorksheetFilter">
              <FilterConfig
                canEdit
                feOnly
                supportGroup
                version={sheetId}
                projectId={globalSheetInfo.projectId}
                appId={globalSheetInfo.appId}
                columns={dealRelationControls(controls)}
                conditions={filterItems}
                sheetSwitchPermit={sheetSwitchPermit}
                viewId={viewId}
                from="relateSheet"
                filterResigned={false}
                showCustom={true}
                currentColumns={totalControls}
                onConditionsChange={conditions => {
                  this.setState({ items: conditions });
                }}
              />
            </div>
          </SettingItem>

          <EmptyRuleConfig
            {...this.props}
            filters={filterItems}
            handleChange={value => this.setState({ emptyRule: value })}
          />

          <SettingItem className="mTop12">
            <div className="settingItemTitle">{_l('赋值')}</div>
            <div className="Gray_75 mBottom12">{_l('将查询到的记录值写入当前当前表单字段。')}</div>
            <div className="mappingItem mBottom0">
              <div className="mappingTitle">{_l('当前表单字段')}</div>
              <div className="mappingTitle">{_l('查询表字段')}</div>
            </div>
            {configs.map((item, index) => this.renderMappingItem(item, index))}
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
                  list={this.filterSelectControls()}
                  onClick={item => {
                    let childConfigs = [];
                    if (item.type === 34) {
                      const relateControls = (item.relationControls || []).filter(
                        r => r.type !== 34 && _.includes(item.showControls || [], r.controlId),
                      );
                      childConfigs = this.filterSelectControls(relateControls).map(i => ({
                        pid: item.controlId,
                        cid: i.controlId,
                        subCid: '',
                      }));
                    }
                    this.setState({
                      configs: this.state.configs.concat([{ cid: item.controlId, subCid: '' }, ...childConfigs]),
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
                  <i className="icon icon-plus mRight8"></i>
                  {_l('选择字段')}
                </span>
              </div>
            </Trigger>
          </SettingItem>

          <SettingItem className="mTop12">
            <div className="settingItemTitle">{_l('查询到多条时')}</div>
            <RadioGroup
              size="middle"
              checkedValue={moreType}
              data={RadioDisplay}
              onChange={value => this.setState({ moreType: value })}
            />
          </SettingItem>
          <SettingItem className="mTop12">
            <div className="settingItemSubTitle">{_l('排序规则')}</div>
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

          <SettingItem className="mTop12">
            <div className="settingItemTitle">{_l('未查询到记录时')}</div>
            <RadioGroup
              size="middle"
              checkedValue={recordsNotFound}
              data={EmptyDisplay}
              onChange={value => this.setState({ recordsNotFound: value })}
            />
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
      </Dialog>
    );
  }
}

export default function SearchWorksheet(props) {
  const { actionData = {}, handleOk, customQueryConfig = [] } = props;
  const [{ advancedSetting, visible }, setState] = useSetState({
    advancedSetting: actionData.advancedSetting,
    visible: true,
  });

  useEffect(() => {
    setState({
      advancedSetting: actionData.advancedSetting,
    });
  }, []);

  if (!visible) return null;

  const dynamicData = safeParse((advancedSetting || {}).dynamicsrc || '{}');

  return (
    <SearchWorksheetActionDialog
      {...props}
      dynamicData={dynamicData}
      queryConfig={_.find(customQueryConfig, q => q.id === dynamicData.id) || {}}
      handleChange={value => {
        const tempValue = { dynamicsrc: JSON.stringify(value) };
        handleOk({ ...actionData, advancedSetting: tempValue });
        setState({ visible: false });
      }}
    />
  );
}
