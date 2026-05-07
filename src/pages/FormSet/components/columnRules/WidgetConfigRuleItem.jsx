import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Drawer } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { redefineComplexControl } from 'worksheet/common/WorkSheetFilter/util';
import { isRelateMoreList } from 'src/components/Form/core/formUtils/helper';
import { getValueStyle } from 'src/utils/control';
import DrawerFooter from '../DrawerFooter';
import { checkRuleEnableLimit, filterData, hasRuleChanged, TAB_TYPES } from './config';
import EditBox from './EditBox';
import * as actions from './redux/actions/columnRules';
import * as columnRules from './redux/actions/columnRules';
import '../../index.less';

const StyleDivWrap = styled.div`
  border-radius: 3px;
  text-align: center;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
  height: 32px;
  line-height: 32px;
  width: 32px;
  ${props => props.styleOptions && `font-size: ${props.fontSize};${props.styleOptions.valueStyle}`}
`;

const AddRule = styled.div`
  height: 36px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--color-primary);
  cursor: pointer;
  border: 1px solid var(--color-border-primary);
  color: var(--color-primary);
  i {
    color: var(--color-primary);
    margin-right: 4px;
    font-size: 15px;
  }
  &:hover {
    i {
      color: var(--color-link-hover);
    }
    color: var(--color-link-hover);
    background: var(--color-background-hover);
  }
`;

const RuleStyleWrapper = styled.div`
  width: 100%;
  .ruleItemBox {
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    border: 1px solid var(--color-border-primary);
    box-sizing: border-box;
    margin-bottom: 10px;
    padding-left: 8px;
    cursor: pointer;
    &:hover {
      background: var(--color-background-hover);
    }
    .name {
      font-weight: bold;
    }
    .filterLabel {
      font-size: 12px;
      color: var(--color-text-secondary);
    }
    .optionsContent {
      height: 100%;
      .iconBox {
        display: inline-block;
        height: inherit;
        width: 36px;
        line-height: 46px;
        text-align: center;
        &:hover {
          background-color: rgba(22, 119, 255, 0.06);
        }

        &:nth-child(1) {
          line-height: 48px;
          vertical-align: middle;
        }

        &:nth-child(2) {
          color: var(--color-text-tertiary);
        }
        &:nth-child(3) {
          color: var(--color-error);
        }
      }
    }
  }
`;

export const StyleDiv = props => {
  const data = { type: 2, advancedSetting: { ...JSON.parse(props.message || '{}') }, value: '123' };
  const styleOptions = getValueStyle(data);
  const fontSize = data.advancedSetting.valuesize ? '14px' : '12px';
  return (
    <StyleDivWrap styleOptions={styleOptions} fontSize={fontSize}>
      {data.value}
    </StyleDivWrap>
  );
};

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
          <span className="mLeft10 mRight10 textTertiary Font13">{item.spliceType === 2 ? _l('或') : _l('且')}</span>
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
          <span className={cx({ textDisabled: disabled })}>
            {filterItemTexts.length > 1 ? <span className="textTertiary mRight2">(</span> : null}
            {(item.groupFilters || []).map((child, childIdx) => {
              return renderItemText(child, childIdx);
            })}
            {filterItemTexts.length > 1 ? <span className="textTertiary mLeft2">)</span> : null}
            {index !== filterItemTexts.length - 1 ? (
              <span className="mLeft10 mRight10">{item.spliceType === 2 ? _l('或') : _l('且')}</span>
            ) : null}
          </span>
        );
      })}
    </React.Fragment>
  );
}

class WidgetConfigRuleItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDeleteBox: null,
    };
  }

  componentWillUnmount() {
    this.props.clearColumnRules();
  }

  componentDidMount() {
    const { initGlobalRuleInfo, initWorksheetRuleList } = this.props;

    initGlobalRuleInfo(this.props);
    initWorksheetRuleList(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const { initGlobalRuleInfo, initWorksheetRuleList, ruleList, saveIndex } = nextProps;

    if (!_.isUndefined(ruleList) && _.isUndefined(this.props.ruleList)) {
      initGlobalRuleInfo(nextProps);
      initWorksheetRuleList(nextProps);
    }

    if (saveIndex !== this.props.saveIndex) {
      initGlobalRuleInfo(nextProps);
    }
  }

  renderContent(ruleData) {
    const {
      selectColumnRules,
      deleteControlRules,
      copyControlRules,
      updateRuleAttr,
      worksheetControls,
      selectRules = {},
      columnRulesListData,
    } = this.props;
    const { showDeleteBox } = this.state;
    const { filters = [], ruleItems = [], ruleId, disabled, name } = ruleData;
    const message = _.get(ruleItems, '0.message');
    return (
      <div
        className={cx('ruleItemBox', { active: selectRules.ruleId === ruleId, disabled: disabled })}
        onClick={() => {
          if (hasRuleChanged(columnRulesListData, selectRules)) return;
          selectColumnRules(ruleData);
        }}
      >
        <StyleDiv message={message} />
        <div className="flex flexColumn overflow_ellipsis mLeft8">
          <span className="name overflow_ellipsis">{name}</span>
          <span className="filterLabel overflow_ellipsis">
            {renderFilterItemTexts(filters, disabled, worksheetControls)}
          </span>
        </div>

        <div className="optionsContent" onClick={e => e.stopPropagation()}>
          <Tooltip placement="bottom" title={disabled ? _l('停用') : _l('开启')}>
            <span className="iconBox">
              <Icon
                className="Font24 Hand"
                icon={ruleData.disabled ? 'ic_toggle_off' : 'ic_toggle_on'}
                style={{ color: ruleData.disabled ? 'var(--color-text-disabled)' : 'var(--color-success)' }}
                onClick={() => {
                  if (ruleData.disabled && !checkRuleEnableLimit(columnRulesListData)) {
                    return;
                  }

                  updateRuleAttr('disabled', !ruleData.disabled, ruleId);
                }}
              />
            </span>
          </Tooltip>
          <Tooltip placement="bottom" title={_l('复制')}>
            <span className="iconBox">
              <Icon icon="copy" className="Font16 Hand" onClick={() => copyControlRules(ruleData)} />
            </span>
          </Tooltip>
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
                  <div className="textTertiary Hand" onClick={() => this.setState({ showDeleteBox: null })}>
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
              <span className="iconBox">
                <Icon icon="trash" className="Font16 Hand" />
              </span>
            </Tooltip>
          </Trigger>
        </div>
      </div>
    );
  }

  render() {
    const {
      columnRulesListData = [],
      addColumnRules,
      selectRules = {},
      clearColumnRules,
      saveLoading,
      saveControlRules,
      data = {},
    } = this.props;
    const isAdd = (selectRules.ruleId || '').indexOf('-') >= 0;
    const styleRuleList = columnRulesListData.filter(rule => {
      const controls = _.get(rule, 'ruleItems.0.controls', []);
      return rule.type === TAB_TYPES.STYLE_RULE && _.some(controls, control => control.controlId === data.controlId);
    });

    return (
      <div className="formSetWorksheet">
        <RuleStyleWrapper>
          {styleRuleList.length > 0 ? styleRuleList.map(rule => this.renderContent(rule)) : null}
          <AddRule onClick={() => addColumnRules()}>
            <Icon icon="add" className="Bold" />
            {_l('规则')}
          </AddRule>
        </RuleStyleWrapper>
        {selectRules.ruleId && (
          <Drawer
            className="widgetColumnRulesDrawer"
            width={640}
            title={isAdd ? _l('新建样式规则') : _l('编辑样式规则')}
            placement="right"
            onClose={() => clearColumnRules()}
            visible={true}
            getContainer={() => document.querySelector('.customWidgetContainer') || document.body}
            closeIcon={<i className="icon-close Font20" />}
            footer={
              <DrawerFooter
                saveLoading={saveLoading}
                disabled={saveLoading || !hasRuleChanged(columnRulesListData, selectRules, true)}
                onCancel={() => clearColumnRules()}
                handleSave={() => saveControlRules()}
              />
            }
          >
            <EditBox />
          </Drawer>
        )}
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

export default connect(mapStateToProps, mapDispatchToProps)(WidgetConfigRuleItem);
