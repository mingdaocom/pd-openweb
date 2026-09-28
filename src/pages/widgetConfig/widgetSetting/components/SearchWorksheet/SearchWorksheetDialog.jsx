import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Modal, Popover, Radio, Select, Tooltip } from 'ming-ui/antd-components';
import worksheetAjax from 'src/api/worksheet';
import { checkConditionCanSave } from 'src/pages/FormSet/components/columnRules/config';
import { SettingItem } from 'src/pages/widgetConfig/styled';
import 'src/pages/widgetConfig/styled/style.less';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue';
import SortConditions from 'src/pages/worksheet/common/ViewConfig/components/SortConditions';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import SelectWorksheet from 'src/pages/worksheet/components/SelectWorksheet/SelectWorksheet';
import { handleAdvancedSettingChange } from 'src/utils/domain/control/advancedSetting';
import { getControls } from 'src/utils/domain/control/dynamicValue';
import { DYNAMIC_FROM_MODE } from 'src/utils/domain/control/dynamicValueConfig';
import { redefineComplexControl } from 'src/utils/domain/control/normalization';
import { isSheetDisplay } from 'src/utils/domain/control/style';
import { getDefaultCount } from 'src/utils/domain/control/type';
import { FORM_HIDDEN_CONTROL_IDS, ROW_ID_CONTROL, SYS_CONTROLS } from 'src/utils/domain/control/widget';
import { RESULT_DISPLAY } from '../CustomEvent/config';
import { SearchWorksheetWrap } from '../DynamicDefaultValue/styled';
import EmptyRuleConfig from '../EmptyRuleConfig';
import SelectControl from '../SelectControl';

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

export default class SearchWorksheetDialog extends Component {
  constructor(props) {
    super(props);
    const {
      data: { relationControls = [] },
    } = props;
    this.state = {
      initialized: false,
      id: '', //工作表查询配置id
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
      controlVisible: false,
      relationControls: relationControls,
      sheetSwitchPermit: [],
      views: [],
      emptyRule: '',
    };
  }

  componentDidMount() {
    this.setValue();
  }

  setValue() {
    const { globalSheetInfo = {}, dynamicData = {}, data = {}, queryConfig = {} } = this.props;

    let stateParams = {
      appId: globalSheetInfo.appId,
      appName: this.relateField()
        ? _.get(window.subListSheetConfig, `${data.controlId}.sheetInfo.appName`)
        : globalSheetInfo.appName,
      sheetId: this.relateField() ? data.dataSource : '',
      sheetName: this.relateField() ? data.sourceEntityName : '',
      controls: this.relateField() ? this.state.relationControls : [],
      sheetSwitchPermit: this.relateField()
        ? _.get(window.subListSheetConfig, `${data.controlId}.sheetInfo.switches`)
        : [],
      views: this.relateField() ? _.get(window.subListSheetConfig, `${data.controlId}.sheetInfo.switches.views`) : [],
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
        resultType: queryConfig.resultType || 0,
        moreSort: queryConfig.moreSort,
        queryCount: queryConfig.queryCount,
        controls: tempControls,
        appId: queryConfig.appId || globalSheetInfo.appId,
        sheetId: queryConfig.sourceId,
        sheetName: queryConfig.sourceName,
        isSheetDelete: isDelete,
        appName: queryConfig.appName,
      };
    }

    this.setState({
      ...stateParams,
      initialized: true,
    });
  }

  relateField = () => {
    const { data = {} } = this.props;
    return _.includes([29], data.type);
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

  handleWorksheetChange = (newAppId, newSheetId, worksheet = {}) => {
    const { appId, appName, sheetId } = this.state;
    if (newSheetId === sheetId) return;

    this.setState(
      {
        appId: newAppId,
        appName: worksheet.appName || (newAppId === appId ? appName : ''),
        sheetId: newSheetId,
        sheetName: worksheet.workSheetName || '',
        isSheetDelete: false,
        controls: [],
        items: [],
        configs: [],
        moreSort: [],
        moreType: 0,
        recordsNotFound: 0,
        resultType: 0,
        sheetSwitchPermit: [],
        views: [],
      },
      this.setControls,
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
      recordsNotFound,
      resultType,
      queryCount,
      emptyRule,
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
      items: items.map(i => {
        if (i.isGroup) {
          return { ...i, groupFilters: (i.groupFilters || []).map(g => ({ ...g, emptyRule })) };
        }

        return { ...i, emptyRule };
      }),
      configs,
      moreType,
      recordsNotFound,
      resultType,
      moreSort,
      queryCount,
      eventType: from === DYNAMIC_FROM_MODE.CUSTOM_EVENT ? 1 : from === DYNAMIC_FROM_MODE.RULES ? 2 : 0,
    };
    worksheetAjax.saveQuery(params).then(res => {
      const value = {
        id: res.id,
        sourceId: sheetId,
      };
      onChange(
        handleAdvancedSettingChange(data, {
          dynamicsrc: JSON.stringify(value),
          defaultfunc: '',
          defsource: JSON.stringify([]),
          defaulttype: '2',
        }),
      );
      updateQueryConfigs({ ...params, ...value, templates: [{ controls }], appName });
      onClose();
    });
  };

  // 获取子表下拉数据或查询表下拉数据
  getDropData = (controls = [], control = {}, hasRowId) => {
    let filterControls = getControls({
      data: control,
      controls,
      isCurrent: true,
      from: DYNAMIC_FROM_MODE.SEARCH_WORKSHEET,
    });
    filterControls = filterControls.filter(i => !_.includes(['wfftime', 'rowid'], i.controlId));
    // 有记录id选项(同查询表的关联记录或者文本类控件)
    if (hasRowId) {
      if ((control.type === 29 && control.dataSource === this.state.sheetId) || _.includes([2, 32], control.type))
        filterControls = ROW_ID_CONTROL.concat(filterControls);
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
        _.includes([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 15, 16, 19, 23, 24, 26, 27, 28, 35, 36, 40, 41, 46, 48], co.type) ||
        (co.type === 29 && !isSheetDisplay(co))
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
                  <Tooltip title={_l('ID: %0', item.cid)} placement="bottom">
                    <span className="Red">{_l('字段已删除')}</span>
                  </Tooltip>
                )}
              </div>
              <span className="mLeft20 mRight20">=</span>
              <Select
                className="mapppingDropdown"
                placeholder={
                  isDelete ? (
                    <Tooltip title={_l('ID: %0', item.subCid)} placement="bottom">
                      <span className="Red">{_l('字段已删除')}</span>
                    </Tooltip>
                  ) : (
                    _l('选择查询表字段')
                  )
                }
                value={isDelete ? undefined : item.subCid || undefined}
                options={subControls.map(({ text, ...option }) => ({ ...option, label: text }))}
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
                <i className="icon-trash Font17 textTertiary hoverColorPrimary"></i>
              </span>
            </div>
          );
        })}
      </React.Fragment>
    );
  };

  render() {
    const {
      initialized,
      sheetId,
      appId,
      controls = [], //动态字段值显示的Controls
      configs = [],
      items = [],
      relationControls = [],
      controlVisible,
      moreType,
      recordsNotFound,
      resultType,
      moreSort,
      queryCount,
      sheetSwitchPermit,
      customTitle,
      views = [],
    } = this.state;
    const {
      from,
      onClose,
      data = {},
      globalSheetInfo = {},
      allControls = [],
      queryControls = [],
      eventKey,
    } = this.props;
    const totalControls = (from === 'subList' ? queryControls : allControls).map(redefineComplexControl);
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

    const viewId = _.get(views, '0.viewId');

    const checkFilters = _.isEmpty(items) || !checkConditionCanSave(items);
    const checkConfigs = _.isEmpty(configs) || !_.every(configs, con => !!con.cid);
    const okDisabled =
      eventKey === 'filters'
        ? !sheetId || checkFilters
        : normalField
          ? !sheetId || checkFilters || _.isEmpty(configs)
          : selfRelate
            ? checkFilters
            : !sheetId || checkFilters || checkConfigs;

    const isDelete =
      _.get(configs[0] || {}, 'subCid') &&
      !_.find(controls, con => con.controlId === _.get(configs[0] || {}, 'subCid'));
    const queryFieldOptions = this.getDropData(controls, data).map(item => ({ ...item, label: item.text }));

    const filterItems = JSON.parse(JSON.stringify(items).replace(/"rcid":"parent"/g, '"rcid":""'));
    return (
      <Modal
        open={true}
        mask={{ closable: true }}
        keyboard
        title={<span className="Bold">{customTitle || _l('查询工作表')}</span>}
        width={640}
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
            {initialized && (
              <SelectWorksheet
                worksheetType={0}
                projectId={globalSheetInfo.projectId}
                appId={appId || globalSheetInfo.appId}
                currentWorksheetId={globalSheetInfo.worksheetId}
                value={sheetId}
                disabled={relateField}
                onChange={this.handleWorksheetChange}
              />
            )}
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle">{_l('查询条件')}</div>
            <div className="searchWorksheetFilter">
              <FilterConfig
                canEdit
                feOnly
                supportGroup
                disableAddCondition={!sheetId}
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

          {eventKey === 'filters' ? (
            <SettingItem className="mTop12">
              <div className="settingItemTitle">{_l('查询到以下结果时条件成立')}</div>
              <Radio.Group
                size="middle"
                className="searchRadio"
                vertical={true}
                value={resultType}
                options={(RESULT_DISPLAY || []).map(({ text, ...option }) => ({ ...option, label: text }))}
                onChange={event =>
                  this.setState({
                    resultType: event.target.value,
                  })
                }
              />
            </SettingItem>
          ) : (
            <Fragment>
              <SettingItem className="mTop12">
                <div className="settingItemTitle">{_l('赋值')}</div>
                {normalField && (
                  <Fragment>
                    <div>
                      {_l('将')}
                      <Select
                        className="mLeft12 mRight12 Width250"
                        showPopupSearch
                        optionFilterProp="label"
                        placeholder={
                          isDelete ? (
                            <Tooltip placement="bottom" title={_l('ID: %0', _.get(configs[0] || {}, 'subCid'))}>
                              <span className="Red">{_l('字段已删除')}</span>
                            </Tooltip>
                          ) : (
                            _l('选择查询表字段')
                          )
                        }
                        disabled={!sheetId}
                        value={isDelete ? undefined : _.get(configs[0] || {}, 'subCid')}
                        labelRender={selectData => {
                          return <span>{_.get(_.find(controls, { controlId: selectData.value }), 'controlName')}</span>;
                        }}
                        options={queryFieldOptions}
                        optionRender={({ data: selectData = {} }) => {
                          return (
                            <span title={selectData.text}>
                              {selectData.text}
                              {selectData.isEqualSource && (
                                <span className="textTertiary subText">（{_l('相同选项集')}）</span>
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
                    <div className="textSecondary mBottom12">
                      {_l('查询到的每行记录添加为一行子表明细。请选择需要写入的字段。')}
                    </div>
                    {this.renderMapping()}
                    <Popover
                      trigger="click"
                      open={controlVisible}
                      onOpenChange={controlVisible => {
                        if (!sheetId) {
                          return;
                        }

                        this.setState({ controlVisible });
                      }}
                      content={
                        <SelectControl
                          list={this.filterSelectControls(relationControls)}
                          onClick={item => {
                            this.setState({
                              configs: this.state.configs.concat([{ cid: item.controlId, subCid: '' }]),
                            });
                          }}
                        />
                      }
                      placement="bottomLeft"
                      noPadding
                      styles={{ container: { width: 280 } }}
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
                          {_l('选择子表字段')}
                        </span>
                      </div>
                    </Popover>
                  </div>
                )}
              </SettingItem>

              {/**普通、关联单条、级联 */}
              {(normalField || (data.type === 29 && data.enumDefault === 1) || selfCascader) && (
                <SettingItem className="mTop12">
                  <div className="settingItemTitle">{_l('查询到多条时')}</div>
                  <Radio.Group
                    size="middle"
                    value={moreType}
                    options={(RadioDisplay || []).map(({ text, ...option }) => ({ ...option, label: text }))}
                    onChange={event =>
                      this.setState({
                        moreType: event.target.value,
                      })
                    }
                  />
                </SettingItem>
              )}

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
                <Radio.Group
                  size="middle"
                  value={recordsNotFound}
                  options={(EmptyDisplay || []).map(({ text, ...option }) => ({ ...option, label: text }))}
                  onChange={event =>
                    this.setState({
                      recordsNotFound: event.target.value,
                    })
                  }
                />
              </SettingItem>
            </Fragment>
          )}
        </SearchWorksheetWrap>
      </Modal>
    );
  }
}
