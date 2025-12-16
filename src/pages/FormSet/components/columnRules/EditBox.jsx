import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Select } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Checkbox, Icon, RadioGroup, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { ALL_SYS } from 'src/pages/widgetConfig/config/widget';
import { HAS_DYNAMIC_TYPE } from 'src/pages/widgetConfig/widgetSetting/components/CustomEvent/config';
import DynamicDefaultValue from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue';
import { DYNAMIC_FROM_MODE } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/config.js';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import SelectControls from 'src/pages/worksheet/common/WorkSheetFilter/components/SelectControls';
import { redefineComplexControl } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/utils/control';
import ActionDropDown from './actionDropdown/ActionDropDown';
import {
  ACTION_DISPLAY,
  filterUnAvailable,
  getActionLabelByType,
  getErrorControls,
  originActionItem,
  SUBMIT_DISPLAY,
  TAB_TYPES,
} from './config';
import * as actions from './redux/actions/columnRules';
import * as columnRules from './redux/actions/columnRules';

class EditBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: (props.selectRules || {}).name || '',
      message: _.get(props.selectRules, 'ruleItems[0].message') || '',
      visible: false,
      fieldVisibleId: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectRules.name !== this.state.name) {
      this.setState({ name: nextProps.selectRules.name });
    }
    if (_.get(nextProps.selectRules, 'ruleItems[0].message') !== this.state.message) {
      this.setState({ message: _.get(nextProps.selectRules, 'ruleItems[0].message') });
    }
  }

  // 筛选条件
  renderCondition = () => {
    const {
      selectRules,
      projectId,
      worksheetControls,
      updateSelectRule,
      updateError,
      ruleError = {},
      appId,
      sheetSwitchPermit,
      activeTab,
    } = this.props;
    let filterControls = worksheetControls
      .filter(i => !_.includes(['wfname', 'wfcuaids', 'wfcaid', 'wfctime', 'wfrtime', 'wfftime', 'rowid'], i.controlId))
      .map(redefineComplexControl);
    if (activeTab === TAB_TYPES.LOCK_RULE) {
      filterControls = filterControls.filter(i => _.includes([9, 10, 11, 36], i.type));
    }
    return (
      <div className="conditionContainer">
        <div className="Font14 Bold">
          {activeTab === TAB_TYPES.LOCK_RULE ? _l('当变更为以下条件时，锁定') : _l('当满足以下条件时')}
        </div>
        <FilterConfig
          canEdit
          feOnly
          isRules={true}
          version={selectRules.ruleId}
          supportGroup={activeTab !== TAB_TYPES.LOCK_RULE}
          projectId={projectId}
          appId={appId}
          from={'rule'}
          columns={filterControls}
          sheetSwitchPermit={sheetSwitchPermit}
          currentColumns={filterControls}
          showCustom={true}
          conditions={selectRules.filters}
          filterError={ruleError.filterError || []}
          onConditionsChange={(conditions = []) => {
            const newConditions = conditions.some(item => item.groupFilters)
              ? conditions
              : [
                  {
                    spliceType: 2,
                    isGroup: true,
                    groupFilters: conditions,
                  },
                ];
            updateSelectRule('filters', newConditions);
            if ((_.flatten(ruleError.filterError) || []).filter(i => i).length) {
              updateError('filters', newConditions);
            }
          }}
        />
      </div>
    );
  };

  // 设置值
  renderSetFieldValue = (actionItem, actionIndex, filterControls) => {
    const {
      selectRules = {},
      updateSelectRule,
      queryConfigs = [],
      updateQueryConfigs,
      projectId,
      appId,
      worksheetId,
      updateError,
      ruleError = {},
      worksheetRelationSearch,
    } = this.props;
    const { fieldVisibleId = '' } = this.state;
    const { ruleItems = [] } = selectRules;
    const { controls = [] } = actionItem;
    const { setValueError = {} } = ruleError;
    const currentActionData = { ...ruleItems[actionIndex] };

    const renderField = () => {
      const selectControls = filterControls.filter(
        i => _.includes(HAS_DYNAMIC_TYPE, i.type) && !_.find(controls, a => a.controlId === i.controlId),
      );
      return (
        <Trigger
          action={['click']}
          popupVisible={fieldVisibleId === `${actionIndex}`}
          onPopupVisibleChange={visible => {
            this.setState({ fieldVisibleId: visible ? `${actionIndex}` : '' });
          }}
          popupAlign={{
            points: ['tr', 'br'],
            offset: [0, 12],
            overflow: {
              adjustX: true,
              adjustY: true,
            },
          }}
          popup={
            <SelectControls
              controls={selectControls}
              onAdd={control => {
                const newActionData = {
                  ...currentActionData,
                  controls: (currentActionData.controls || []).concat([
                    { controlId: control.controlId, type: '', value: '' },
                  ]),
                };
                ruleItems.splice(actionIndex, 1, newActionData);
                updateSelectRule('ruleItems', ruleItems);
                this.setState({ fieldVisibleId: '' });
              }}
            />
          }
          getPopupContainer={() => this.addField}
        >
          <div className="addField" ref={con => (this.addField = con)}>
            <Icon icon="plus" className="mRight8" />
            {_l('字段')}
          </div>
        </Trigger>
      );
    };

    if (_.isEmpty(controls)) {
      return (
        <div className="setFieldContainer">
          {renderField()}
          <Icon
            icon="trash"
            className="Gray_9e deleteBtn Hand"
            onClick={() => {
              ruleItems.splice(actionIndex, 1);
              updateSelectRule('ruleItems', ruleItems);
            }}
          />
        </div>
      );
    }

    return (
      <div className="flexColumn flex">
        {controls.map((i, childIndex) => {
          const control = worksheetRelationSearch.find(c => c.controlId === i.controlId);
          const queryId = i.type === '2' && _.get(safeParse(i.value), 'id');
          const error = setValueError[`${actionIndex}-${childIndex}`];
          return (
            <div className="flexColumn mBottom12">
              <div className="setFieldContainer mBottom12">
                <div className="fieldItem overflowEllipsis" key={i.controlId}>
                  <span className={cx({ Red: !control })}>{control ? control.controlName : _l('字段已删除')}</span>
                </div>
                <Icon
                  icon="trash"
                  className="Gray_9e deleteBtn Hand"
                  onClick={() => {
                    const newActionData = {
                      ...currentActionData,
                      controls: (currentActionData.controls || []).filter((c, cIndex) => cIndex !== childIndex),
                    };
                    controls.length === 1
                      ? ruleItems.splice(actionIndex, 1)
                      : ruleItems.splice(actionIndex, 1, newActionData);

                    updateSelectRule('ruleItems', ruleItems);
                    updateError('setValue', 'delete', `${actionIndex}-${childIndex}`);
                  }}
                />
              </div>
              {control && (
                <div className="setFieldContainer pRight42">
                  <span className="mRight10">{_l('值设为')}</span>
                  <div className={cx('flex', { setValueError: error })}>
                    <DynamicDefaultValue
                      allControls={filterControls}
                      globalSheetInfo={{ projectId, appId, worksheetId }}
                      data={handleAdvancedSettingChange(control, {
                        [i.type === '1' ? 'defaultfunc' : i.type === '2' ? 'dynamicsrc' : 'defsource']: i.value,
                        defaulttype: i.type === '0' ? '' : i.type,
                      })}
                      hideTitle={true}
                      from={DYNAMIC_FROM_MODE.RULES}
                      showEmpty={true}
                      {...(queryId ? { queryConfig: _.find(queryConfigs, c => c.id === queryId) || {} } : {})}
                      updateQueryConfigs={newConfig => {
                        const index = _.findIndex(queryConfigs, item => item.id === newConfig.id);
                        const newQueryConfigs =
                          index > -1
                            ? queryConfigs.map(item => {
                                return item.id === newConfig.id && newConfig.worksheetId ? newConfig : item;
                              })
                            : queryConfigs.concat([newConfig]);

                        updateQueryConfigs(newQueryConfigs);
                      }}
                      onChange={newData => {
                        const { defsource, defaulttype, defaultfunc, dynamicsrc } = getAdvanceSetting(newData);
                        const dataDetail =
                          defaulttype === '1' ? defaultfunc : defaulttype === '2' ? dynamicsrc : defsource;
                        const tempValue = {
                          type: defaulttype || '0',
                          value: dataDetail,
                        };
                        const newActionData = {
                          ...currentActionData,
                          controls: (currentActionData.controls || []).map((c, cIndex) => {
                            return cIndex === childIndex ? { ...c, ...tempValue } : c;
                          }),
                        };
                        ruleItems.splice(actionIndex, 1, newActionData);
                        updateSelectRule('ruleItems', ruleItems);
                        updateError('setValue', dataDetail, `${actionIndex}-${childIndex}`);
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div className="setFieldContainer pRight42">{renderField()}</div>
      </div>
    );
  };

  // 执行动作
  renderAction = () => {
    const { selectRules = {}, updateSelectRule, worksheetControls, ruleError = {}, updateError } = this.props;
    const { visible } = this.state;
    let { ruleItems = [] } = selectRules;
    let listData = ACTION_DISPLAY.filter(i => i.value !== 6);

    // 单条业务规则只能配置一个【只读所有字段】，枚举7
    if (ruleItems.some(i => i.type === 7)) {
      listData = listData.filter(i => i.value !== 7);
    }

    const filterControls = worksheetControls.filter(i => !_.includes(ALL_SYS, i.controlId));

    return (
      <div className="conditionContainer mTop0">
        <div className="Font14 Bold">{_l('则执行动作')}</div>
        {ruleItems.map((actionItem, actionIndex) => {
          const actionError = (ruleError.actionError || {})[actionIndex] || false;
          return (
            <div className="actionItemCon">
              <Select
                className={cx('ruleListSelect', { flexItem: _.includes([7], actionItem.type) })}
                dropdownClassName="ruleListSelectDropdown"
                value={getActionLabelByType(actionItem.type)}
                options={listData}
                disabled={_.includes([9], actionItem.type)}
                suffixIcon={<Icon icon="arrow-down-border Font14" />}
                onChange={type => {
                  let currentActionData = { ...ruleItems[actionIndex] };
                  currentActionData.type = type;
                  if (_.includes([7, 9], type)) {
                    currentActionData.controls = [];
                    currentActionData.message = '';
                  }
                  // 过滤不符合条件的已选字段
                  if (_.includes([1, 2, 3, 4, 5], type)) {
                    currentActionData = filterUnAvailable(currentActionData, worksheetControls, type);
                  }
                  ruleItems.splice(actionIndex, 1, currentActionData);
                  updateSelectRule('ruleItems', ruleItems);
                }}
              />
              {actionItem.type === 9 ? (
                this.renderSetFieldValue(actionItem, actionIndex, filterControls)
              ) : (
                <Fragment>
                  {_.includes([7], actionItem.type) ? null : (
                    <ActionDropDown
                      actionError={actionError}
                      showSelectAll={true}
                      from="rule"
                      actionType={actionItem.type}
                      values={actionItem.controls}
                      dropDownData={filterControls}
                      onChange={(key, value) => {
                        let currentActionData = { ...ruleItems[actionIndex] };
                        currentActionData[key] = value;
                        ruleItems.splice(actionIndex, 1, currentActionData);
                        updateSelectRule('ruleItems', ruleItems);
                        updateError('action', '', actionIndex);
                      }}
                    />
                  )}
                  <Icon
                    icon="trash"
                    className="Gray_9e deleteBtn Hand"
                    onClick={() => {
                      ruleItems.splice(actionIndex, 1);
                      updateSelectRule('ruleItems', ruleItems);
                      updateError('action', '', actionIndex);
                    }}
                  />
                </Fragment>
              )}
            </div>
          );
        })}
        <Trigger
          popupVisible={visible}
          onPopupVisibleChange={visible => {
            this.setState({ visible });
          }}
          popupClassName="addConditionTrigger"
          action={['click']}
          mouseEnterDelay={0.1}
          popupAlign={{ points: ['tl', 'bl'], offset: [0, 4] }}
          popup={() => (
            <Fragment>
              {listData.map(i => (
                <div
                  onClick={() =>
                    updateSelectRule('ruleItems', ruleItems.concat({ ...originActionItem, type: i.value }))
                  }
                >
                  {i.label}
                  {i.warnText && (
                    <Tooltip placement="bottom" title={i.warnText}>
                      <i className="icon-info_outline Gray_9e Font16"></i>
                    </Tooltip>
                  )}
                </div>
              ))}
            </Fragment>
          )}
          getPopupContainer={() => this.addAction}
        >
          <div className="addCondition" ref={con => (this.addAction = con)}>
            <Icon icon="plus" className="mRight8" />
            {_l('添加动作')}
          </div>
        </Trigger>
      </div>
    );
  };

  // 提示方式 ｜ 提示错误
  renderPrompt = () => {
    const {
      selectRules = {},
      updateSelectRule,
      updateError,
      ruleError,
      worksheetControls = [],
      activeTab,
    } = this.props;
    const { hintType = 0, checkType = 0, ruleItems = [] } = selectRules;
    const { controls = [], message = '' } = ruleItems[0] || {};
    const isError = _.get(ruleError, 'actionError[0]');
    const dropData = getErrorControls(worksheetControls);

    return (
      <div className="conditionContainer mTop0">
        <div className="Font14 Bold mBottom20">{_l('则提示错误')}</div>
        <div className="Font14 mBottom12">
          {_l('提示内容')}
          <span className="Red">*</span>
        </div>
        <input
          className={cx('ruleNameInput', { errorBorder: isError && !message })}
          value={this.state.message}
          placeholder={_l('请输入提示内容')}
          onChange={e => this.setState({ message: e.target.value })}
          onBlur={e => {
            const newValue = [{ controls, message: e.target.value, type: 6 }];
            updateSelectRule('ruleItems', newValue);
            isError && updateError('action', newValue[0], 0);
          }}
        />
        <div className="mTop24">
          <div className="Font14 mBottom12">{_l('指定字段')}</div>
          <ActionDropDown
            actionType={6}
            from="rule"
            values={controls}
            activeTab={activeTab}
            dropDownData={dropData}
            onChange={(key, value) => {
              const newVal = [{ controls: value, message, type: 6 }];
              updateSelectRule('ruleItems', newVal);
            }}
          />
        </div>
        <div className="mTop24">
          <div className="Font14 Bold mBottom12">{_l('提示错误后')}</div>
          <RadioGroup
            size="middle"
            vertical={true}
            checkedValue={checkType === 3 ? 3 : 0}
            data={SUBMIT_DISPLAY}
            onChange={value => updateSelectRule('checkType', value)}
          />
        </div>
        <div className="mTop24">
          <div className="Font14 Bold mBottom12">{_l('其他')}</div>
          <Checkbox
            text={
              <span>
                {_l('在字段输入时实时提示')}
                <Tooltip
                  placement="bottom"
                  title={_l(
                    '勾选后，在条件字段输入和失焦时实时提示错误。取消勾选后，只会在最后点击提交按钮时提示错误。',
                  )}
                >
                  <i className="icon-help Gray_9e Font16 Hand mLeft6"></i>
                </Tooltip>
              </span>
            }
            checked={hintType === 0}
            onClick={checked => {
              updateSelectRule('hintType', checked ? 1 : 0);
            }}
          />

          {checkType !== 3 && (
            <Checkbox
              className="mTop12"
              text={
                <span>
                  {_l('保存数据到服务器时再次校验')}
                  <Tooltip
                    placement="bottom"
                    title={
                      <span>
                        {_l(
                          '勾选后，除了对表单已加载数据进行校验外，在数据保存时会再次对服务器中的最新数据进行校验，确保数据严格遵循业务规则约束。',
                        )}
                        <br />
                        {_l(
                          '如：在出库场景中，由于多人提交，在填写期间实际库存数可能会小于表单显示的库存数时，通过此方式可按照服务器的实际库存数进行校验，确保库存数不会为负。',
                        )}
                        <br />
                        {_l('注意：开启后校验速度会变慢，请根据实际场景合理使用。')}
                      </span>
                    }
                  >
                    <i className="icon-help Gray_9e Font16 Hand mLeft6"></i>
                  </Tooltip>
                </span>
              }
              checked={checkType === 1}
              onClick={checked => {
                updateSelectRule('checkType', checked ? 0 : 1);
              }}
            />
          )}
        </div>
      </div>
    );
  };

  renderLockDesc = () => {
    const { selectRules = {}, updateSelectRule } = this.props;
    const { ruleItems = [] } = selectRules;

    return (
      <div className="conditionContainer mTop0">
        <div className="Font14 Bold mBottom20">{_l('锁定说明')}</div>
        <input
          className="ruleNameInput"
          defaultValue={_.get(ruleItems, '0.message')}
          placeholder={_l('请输入提示文案')}
          onBlur={e => {
            const newValue = [{ message: e.target.value }];
            updateSelectRule('ruleItems', newValue);
          }}
        />
      </div>
    );
  };

  renderContent = () => {
    const { activeTab } = this.props;

    // 交互规则
    if (activeTab === TAB_TYPES.NORMAL_RULE) {
      return this.renderAction();
    }

    // 验证规则
    if (activeTab === TAB_TYPES.CHECK_RULE) {
      return this.renderPrompt();
    }

    // 锁定说明
    if (activeTab === TAB_TYPES.LOCK_RULE) {
      return this.renderLockDesc();
    }
  };

  render() {
    const { selectRules = {}, updateSelectRule } = this.props;
    return (
      <ScrollView className="editRuleBox">
        <div className="pTop20 pLeft24 pRight24 pBottom20 box-sizing">
          {selectRules.type !== TAB_TYPES.LOCK_RULE && (
            <Fragment>
              <div className="Font14 Bold">{_l('规则名称')}</div>
              <input
                className="mTop12 ruleNameInput"
                value={this.state.name}
                onChange={e => this.setState({ name: e.target.value })}
                onBlur={e => {
                  const name = e.target.value ? e.target.value : selectRules.name;
                  updateSelectRule('name', name);
                }}
              />
            </Fragment>
          )}

          {this.renderCondition()}
          {this.renderContent()}
        </div>
      </ScrollView>
    );
  }
}

const mapStateToProps = state => ({
  worksheetControls: state.formSet.worksheetRuleControls,
  worksheetRelationSearch: state.formSet.worksheetRelationSearch,
  columnRulesListData: state.formSet.columnRulesListData,
  queryConfigs: state.formSet.queryConfigs,
  selectRules: state.formSet.selectRules,
  projectId: state.formSet.worksheetInfo.projectId,
  appId: state.formSet.worksheetInfo.appId,
  worksheetId: state.formSet.worksheetId,
  ruleError: state.formSet.ruleError,
  sheetSwitchPermit: state.formSet.worksheetInfo.switches,
  activeTab: state.formSet.activeTab,
});
const mapDispatchToProps = dispatch => bindActionCreators({ ...actions, ...columnRules }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(EditBox);
