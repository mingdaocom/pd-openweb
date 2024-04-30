import React, { Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Icon, ScrollView, Checkbox } from 'ming-ui';
import { Select, Tooltip } from 'antd';
import * as actions from './redux/actions/columnRules';
import * as columnRules from './redux/actions/columnRules';
import ActionDropDown from './actionDropdown/ActionDropDown';
import handleSetMsg from './errorMsgDialog/ErrorMsg';
import { actionsListData, originActionItem, getActionLabelByType, filterUnAvailable, getErrorControls } from './config';
import FilterConfig from 'src/pages/worksheet/common/WorkSheetFilter/common/FilterConfig';
import { redefineComplexControl } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { SYS_CONTROLS, SYS } from 'src/pages/widgetConfig/config/widget';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import _ from 'lodash';

class EditBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: (props.selectRules || {}).name || '',
      message: _.get(props.selectRules, 'ruleItems[0].message') || '',
      visible: false,
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

  setErrorMsg = (item, index) => {
    const { selectRules = {}, updateSelectRule, updateError } = this.props;
    let { ruleItems = [] } = selectRules;
    handleSetMsg({
      value: item.message,
      onOk: message => {
        let currentActionData = ruleItems[index] || {};
        currentActionData.message = message;
        ruleItems.splice(index, 1, currentActionData);
        updateSelectRule('ruleItems', ruleItems);
        updateError('action', '', index);
      },
    });
  };

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
    } = this.props;
    const filterControls = worksheetControls
      .filter(i => !_.includes(['wfname', 'wfcuaids', 'wfcaid', 'wfctime', 'wfrtime', 'wfftime', 'rowid'], i.controlId))
      .map(redefineComplexControl);
    return (
      <div className="conditionContainer">
        <div className="Font14 Bold">{_l('当满足以下条件时')}</div>
        <FilterConfig
          canEdit
          feOnly
          isRules={true}
          version={selectRules.ruleId}
          supportGroup={true}
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

  // 执行动作
  renderAction = () => {
    const { selectRules = {}, updateSelectRule, worksheetControls, ruleError = {}, updateError } = this.props;
    const { visible } = this.state;
    let { ruleItems = [] } = selectRules;
    let listData = actionsListData.filter(i => i.value !== 6);

    // 单条业务规则只能配置一个【只读所有字段】，枚举7
    if (ruleItems.some(i => i.type === 7)) {
      listData = listData.filter(i => i.value !== 7);
    }

    const filterControls = worksheetControls.filter(i => !_.includes(SYS_CONTROLS.concat(SYS), i.controlId));

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
                suffixIcon={<Icon icon="arrow-down-border Font14" />}
                onChange={type => {
                  let currentActionData = { ...ruleItems[actionIndex] };
                  currentActionData.type = type;
                  if (_.includes([7], type)) {
                    currentActionData.controls = [];
                    currentActionData.message = '';
                  }
                  if (type === 6) {
                    currentActionData.controls = [];
                  } else {
                    currentActionData.message = '';
                  }
                  // 过滤不符合条件的已选字段
                  if (_.includes([3, 4, 5], type)) {
                    currentActionData = filterUnAvailable(currentActionData, worksheetControls, type);
                  }
                  ruleItems.splice(actionIndex, 1, currentActionData);
                  updateSelectRule('ruleItems', ruleItems);
                }}
              />
              {_.includes([7], actionItem.type) ? null : actionItem.type === 6 ? (
                <div className={cx('errorInputBox Hand', { errorBorder: actionError })}>
                  {actionItem.message ? (
                    <span className="flexRow Gray_75 clearfix LineHeight36">
                      <span className="ellipsis">{actionItem.message}</span>
                      <i
                        className="icon-edit mLeft6 Right TxtMiddle LineHeight36 Hover_49"
                        onClick={() => this.setErrorMsg(actionItem, actionIndex)}
                      />
                    </span>
                  ) : (
                    <span
                      className="ThemeColor3 TxtCenter hoverColor"
                      onClick={() => this.setErrorMsg(actionItem, actionIndex)}
                    >
                      <i className="icon-edit mRight6" />
                      {_l('设置提示')}
                    </span>
                  )}
                </div>
              ) : (
                <ActionDropDown
                  actionError={actionError}
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
                icon="delete1"
                className="Gray_9e deleteBtn Hand"
                onClick={() => {
                  ruleItems.splice(actionIndex, 1);
                  updateSelectRule('ruleItems', ruleItems);
                  updateError('action', '', actionIndex);
                }}
              />
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

          <Checkbox
            className="mTop12"
            text={
              <span>
                {_l('保存数据到服务器时再次校验')}
                <Icon icon="beta1" className="mRight6 mLeft6" style={{ background: '#fff', color: '#43BD36' }} />
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
                  <i className="icon-help Gray_9e Font16 Hand"></i>
                </Tooltip>
              </span>
            }
            checked={checkType === 1}
            onClick={checked => {
              updateSelectRule('checkType', checked ? 0 : 1);
            }}
          />
        </div>
      </div>
    );
  };

  renderContent = () => {
    const { activeTab } = this.props;

    // 交互规则
    if (activeTab === 0) {
      return this.renderAction();
    }

    // 验证规则
    if (activeTab === 1) {
      return this.renderPrompt();
    }
  };

  render() {
    const { selectRules = {}, updateSelectRule } = this.props;
    return (
      <ScrollView className="editRuleBox">
        <div className="pTop20 pLeft24 pRight24 pBottom20 box-sizing">
          <div className="Font14 Bold">{_l('规则名称')}</div>
          <input
            className="mTop12 ruleNameInput"
            value={this.state.name}
            onChange={e => this.setState({ name: e.target.value })}
            onBlur={e => {
              const name = !!e.target.value ? e.target.value : selectRules.name;
              updateSelectRule('name', name);
            }}
          />
          {this.renderCondition()}
          {this.renderContent()}
        </div>
      </ScrollView>
    );
  }
}

const mapStateToProps = state => ({
  worksheetControls: state.formSet.worksheetRuleControls,
  columnRulesListData: state.formSet.columnRulesListData,
  selectRules: state.formSet.selectRules,
  projectId: state.formSet.worksheetInfo.projectId,
  appId: state.formSet.worksheetInfo.appId,
  ruleError: state.formSet.ruleError,
  sheetSwitchPermit: state.formSet.worksheetInfo.switches,
  activeTab: state.formSet.activeTab,
});
const mapDispatchToProps = dispatch => bindActionCreators({ ...actions, ...columnRules }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(EditBox);
