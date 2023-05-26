import React, { Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Icon, ScrollView } from 'ming-ui';
import { Select, Tooltip } from 'antd';
import * as actions from '../../redux/actions/action';
import * as columnRules from '../../redux/actions/columnRules';
import ActionDropDown from './actionDropdown/ActionDropDown';
import handleSetMsg from './errorMsgDialog/ErrorMsg';
import { actionsListData, originActionItem, getActionLabelByType, filterUnAvailable } from './config';
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
      visible: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.selectRules.name !== this.state.name) {
      this.setState({ name: nextProps.selectRules.name });
    }
  }

  setErrorMsg = (item, index) => {
    const { selectRules = {}, updateAction, updateActionError } = this.props;
    let { ruleItems = [] } = selectRules;
    handleSetMsg({
      value: item.message,
      onOk: message => {
        let currentActionData = ruleItems[index] || {};
        currentActionData.message = message;
        ruleItems.splice(index, 1, currentActionData);
        updateAction(ruleItems);
        updateActionError(index);
      },
    });
  };

  renderCondition = () => {
    const {
      selectRules,
      projectId,
      worksheetControls,
      updateFilters,
      ruleError = {},
      updateFilterError,
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
          supportGroup={true}
          projectId={projectId}
          appId={appId}
          from={'rule'}
          columns={filterControls}
          sheetSwitchPermit={sheetSwitchPermit}
          currentColumns={filterControls}
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
            updateFilters(newConditions);
            if ((_.flatten(ruleError.filterError) || []).filter(i => i).length) {
              updateFilterError(newConditions);
            }
          }}
        />
      </div>
    );
  };

  renderAction = () => {
    const { selectRules = {}, updateAction, worksheetControls, ruleError = {}, updateActionError } = this.props;
    const { visible } = this.state;
    let { ruleItems = [] } = selectRules;
    let listData;

    if (
      location.href.indexOf('localhost') > -1 ||
      location.href.indexOf('meihua') > -1 ||
      location.href.indexOf('sandbox') > -1
    ) {
      listData = actionsListData;
    } else {
      listData = actionsListData.filter(it => _.includes([1, 2, 3, 4, 5, 6, 7], it.value));
    }

    return (
      <div className="conditionContainer">
        <div className="Font14 Bold">{_l('则执行动作')}</div>
        {ruleItems.map((actionItem, actionIndex) => {
          const actionError = (ruleError.actionError || {})[actionIndex] || false;
          return (
            <div className="actionItemCon">
              <Select
                className={cx('ruleListSelect', { flexItem: _.includes([7, 8], actionItem.type) })}
                dropdownClassName="ruleListSelectDropdown"
                value={getActionLabelByType(actionItem.type)}
                options={listData}
                suffixIcon={<Icon icon="arrow-down-border Font14" />}
                onChange={type => {
                  let currentActionData = { ...ruleItems[actionIndex] };
                  currentActionData.type = type;
                  if (_.includes([7, 8], type)) {
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
                  updateAction(ruleItems);
                }}
              />
              {_.includes([7, 8], actionItem.type) ? null : actionItem.type === 6 ? (
                <div className={cx('errorInputBox Hand', { errorBorder: ruleError.nameError })}>
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
                  dropDownData={worksheetControls.filter(i => !_.includes(SYS_CONTROLS.concat(SYS), i.controlId))}
                  onChange={(key, value) => {
                    let currentActionData = { ...ruleItems[actionIndex] };
                    currentActionData[key] = value;
                    ruleItems.splice(actionIndex, 1, currentActionData);
                    updateAction(ruleItems);
                    updateActionError(actionIndex);
                  }}
                />
              )}
              <Icon
                icon="delete1"
                className="Gray_9e deleteBtn Hand"
                onClick={() => {
                  ruleItems.splice(actionIndex, 1);
                  updateAction(ruleItems);
                  updateActionError(actionIndex);
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
                <div onClick={() => updateAction(ruleItems.concat({ ...originActionItem, type: i.value }), true)}>
                  {i.label}
                  {i.value === 7 && (
                    <Tooltip
                      placement="bottom"
                      title={_l(
                        '锁定状态在记录保存后生效。锁定的记录不允许用户直接编辑，但可以通过自定义动作和工作流进行填写',
                      )}
                    >
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

  render() {
    const { selectRules = {}, updateRuleName, ruleError = {} } = this.props;
    return (
      <ScrollView className="editRuleBox">
        <div className="pTop20 pLeft24 pRight24 pBottom20 box-sizing">
          <div className="Font14 Bold">{_l('规则名称')}</div>
          <input
            className={cx('mTop12 ruleNameInput', { errorBorder: ruleError.nameError })}
            value={this.state.name}
            onChange={e => this.setState({ name: e.target.value })}
            onBlur={e => {
              const name = !!e.target.value ? e.target.value : selectRules.name;
              updateRuleName(name);
            }}
          />
          {this.renderCondition()}
          {this.renderAction()}
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
  editingId: state.formSet.editingId,
  sheetSwitchPermit: state.formSet.worksheetInfo.switches,
});
const mapDispatchToProps = dispatch => bindActionCreators({ ...actions, ...columnRules }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(EditBox);
