import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';
import { isRelateMoreList } from 'src/components/Form/core/formUtils';
import DynamicText from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/components/DynamicText';
import {
  checkRuleEnableLimit,
  filterData,
  getActionLabelByType,
  getNameWidth,
  getTextById,
  hasRuleChanged,
  TAB_TYPES,
} from './config';
import * as actions from './redux/actions/columnRules';
import * as columnRules from './redux/actions/columnRules';

function renderFilterItemTexts(filters = [], disabled = false, worksheetControls = []) {
  if (_.isEmpty(filters)) return '';
  const formatControls = worksheetControls.map(redefineComplexControl);
  let filterItemTexts = filters.map(item => {
    return {
      ...item,
      groupFilters: (item.groupFilters || []).map(it => {
        let transData = filterData(formatControls, [it], true, formatControls);
        if (it.dataType === 29) {
          const control = _.find(formatControls || [], con => con.controlId === it.controlId);
          if (isRelateMoreList(control, it)) {
            transData = [{ ...transData[0], name: _l('字段已删除') }];
          }
        }
        return transData[0] || {};
      }),
    };
  });

  const renderItemText = (item, index) => {
    return (
      <span key={index}>
        {index ? (
          <span className="mLeft10 mRight10 gray_9e Font13">{item.spliceType === 2 ? _l('或') : _l('且')}</span>
        ) : null}
        {item.id ? (
          <Fragment>
            {item.name}
            <span className="mLeft5 mRight5">{(item.type || {}).text}</span>
            {(item.value || {}).type === 'dynamicSource' ? (
              item.value.data.map(it => {
                return it.name || _l('字段已删除');
              })
            ) : (
              <span className="WordBreak">{item.value}</span>
            )}
          </Fragment>
        ) : (
          _l('字段已删除')
        )}
      </span>
    );
  };

  return (
    <React.Fragment>
      {filterItemTexts.map((item, index) => {
        return (
          <span className={cx({ Gray_bd: disabled })}>
            {filterItemTexts.length > 1 ? <span className="gray_9e mRight2">(</span> : null}
            {(item.groupFilters || []).map((child, childIdx) => {
              return renderItemText(child, childIdx);
            })}
            {filterItemTexts.length > 1 ? <span className="gray_9e mLeft2">)</span> : null}
            {index !== filterItemTexts.length - 1 ? (
              <span className="mLeft10 mRight10">{item.spliceType === 2 ? _l('或') : _l('且')}</span>
            ) : null}
          </span>
        );
      })}
    </React.Fragment>
  );
}

class RuleItems extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDeleteBox: null,
      name: _.get(props, 'ruleData.name') || '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (_.get(nextProps, 'ruleData.name') !== this.state.name) {
      this.setState({ name: _.get(nextProps, 'ruleData.name') });
    }
  }

  renderActionItem = (actionItem, disabled) => {
    const { worksheetControls, projectId } = this.props;
    let leftText = _.includes([7], actionItem.type) ? '' : getActionLabelByType(actionItem.type);
    if (this.props.activeTab === TAB_TYPES.LOCK_RULE) {
      leftText = _l('锁定记录');
    }
    const currentArr = getTextById(worksheetControls, actionItem.controls, actionItem.type, 'rule') || [];

    const renderDetailValue = () => {
      function renderDynamicValue(value, controlId) {
        const dynamicValue = safeParse(value, 'array');

        let currentControl = { type: 2 };
        if (controlId) {
          currentControl = _.find(worksheetControls, a => a.controlId === controlId);
        }

        return (
          <DynamicText
            globalSheetInfo={{ projectId }}
            dynamicValue={dynamicValue}
            data={currentControl}
            controls={worksheetControls}
          />
        );
      }
      if (actionItem.type === 9) {
        return (
          <span className={cx('detailValue mTop6', { Gray_bd: disabled })}>
            {currentArr.map(cur => {
              if (cur.isDel) {
                return <span className="detailValueCon LineHeight30 Red">{_l('字段已删除')}</span>;
              }
              return (
                <div className="detailValueCon LineHeight30">
                  <span className="title">{_l('将')}</span>
                  <span className="mLeft10 mRight10" title={_.get(cur, 'name')}>
                    {_.get(cur, 'name')}
                  </span>
                  <span className="title mRight10">{_l('值设为')}</span>
                  {cur.type === '1'
                    ? _l('函数计算')
                    : cur.type === '2'
                      ? _l('查询工作表')
                      : renderDynamicValue(cur.value, cur.controlId)}
                </div>
              );
            })}
          </span>
        );
      } else {
        let text = '';
        if (_.includes([7], actionItem.type)) {
          text = getActionLabelByType(actionItem.type);
        } else {
          if (actionItem.type === 6) {
            text = _.isEmpty(currentArr)
              ? actionItem.message
              : `${currentArr.map(cur => cur.name).join('、')}：${actionItem.message}`;
          } else {
            text = currentArr.map(cur => cur.name).join(', ');
          }
        }
        return <span className={cx('rightLabel WordBreak', { Gray_bd: disabled })}>{text}</span>;
      }
    };

    return (
      <span className={cx('ruleItemTextRow', { mTop10: actionItem.type !== 9 })}>
        <span className={cx('leftLabel', { Gray_bd: disabled, mTop10: actionItem.type === 9 })}>{leftText}</span>
        {renderDetailValue()}
      </span>
    );
  };

  render() {
    const {
      selectColumnRules,
      deleteControlRules,
      copyControlRules,
      updateRuleAttr,
      worksheetControls,
      selectRules = {},
      ruleData = {},
      columnRulesListData,
    } = this.props;
    const { showDeleteBox, name } = this.state;
    const { filters = [], ruleItems = [], ruleId, disabled, type, checkType } = ruleData;
    return (
      <div
        className={cx('ruleItemCon', { active: selectRules.ruleId === ruleId, disabled: disabled })}
        onClick={() => {
          if (hasRuleChanged(columnRulesListData, selectRules)) return;
          selectColumnRules(ruleData);
        }}
      >
        <div className="ruleNameInputBox" onClick={e => e.stopPropagation()}>
          {type === 1 && <div className={cx('ruleTypeIcon', { isWarning: checkType === 3 })}></div>}
          <input
            className={cx('ruleNameInput', { Gray_bd: disabled })}
            style={{ width: getNameWidth(name) }}
            value={name}
            onFocus={e => {
              if (e.target) {
                e.target.style.width = `${getNameWidth(name)}px`;
              }
            }}
            onChange={e => this.setState({ name: e.target.value })}
            onBlur={() => {
              updateRuleAttr('name', name || ruleData.name, ruleId);
            }}
          />
        </div>
        <span className={cx('ruleItemTextRow', { Gray_bd: disabled })}>
          <span className="leftLabel">{_l('当满足条件')}</span>
          <span className="rightLabel">{renderFilterItemTexts(filters, disabled, worksheetControls)}</span>
        </span>
        {ruleItems.map(actionItem => this.renderActionItem(actionItem, disabled))}

        <div className="ruleItemOptions" onClick={e => e.stopPropagation()}>
          <Tooltip placement="bottom" title={disabled ? _l('停用') : _l('开启')}>
            <Icon
              className="Font24 Hand"
              icon={ruleData.disabled ? 'ic_toggle_off' : 'ic_toggle_on'}
              style={{ color: ruleData.disabled ? '#bdbdbd' : '#43bd36' }}
              onClick={() => {
                if (ruleData.disabled && !checkRuleEnableLimit(columnRulesListData)) {
                  return;
                }
                updateRuleAttr('disabled', !ruleData.disabled, ruleId);
              }}
            />
          </Tooltip>
          {type !== TAB_TYPES.LOCK_RULE && (
            <Tooltip placement="bottom" title={_l('复制')}>
              <Icon icon="copy" className="Font16 Hand Gray_9e Hover_49" onClick={() => copyControlRules(ruleData)} />
            </Tooltip>
          )}
          <Trigger
            popupVisible={showDeleteBox === ruleId}
            onPopupVisibleChange={showDeleteBox => {
              this.setState({ showDeleteBox: showDeleteBox ? ruleId : null });
            }}
            action={['click']}
            mouseEnterDelay={0.1}
            popupAlign={{ points: ['tl', 'tr'], offset: [-30, 25], overflow: { adjustX: 1, adjustY: 2 } }}
            popup={
              <div className="DropdownDeleteRuleTrigger">
                <div className="title">{_l('确定要删除此规则？')}</div>
                <div className="deleteGroupBtns">
                  <div className="Gray_9e Hand" onClick={() => this.setState({ showDeleteBox: null })}>
                    {_l('取消')}
                  </div>
                  <div
                    className="deleteBtn"
                    onClick={() => {
                      deleteControlRules(ruleData);
                      this.setState({ showDeleteBox: null });
                    }}
                  >
                    {_l('删除')}
                  </div>
                </div>
              </div>
            }
          >
            <Tooltip placement="bottom" title={_l('删除')}>
              <Icon icon="trash" className="Font16 Red Hand RedHover" />
            </Tooltip>
          </Trigger>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  worksheetControls: state.formSet.worksheetRuleControls,
  selectRules: state.formSet.selectRules,
  columnRulesListData: state.formSet.columnRulesListData,
  activeTab: state.formSet.activeTab,
});
const mapDispatchToProps = dispatch => bindActionCreators({ ...actions, ...columnRules }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(RuleItems);
