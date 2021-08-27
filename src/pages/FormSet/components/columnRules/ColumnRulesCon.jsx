import React, { Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Icon, Support, Button, ScrollView, Switch, Tooltip } from 'ming-ui';
import Trigger from 'rc-trigger';
import { Drawer } from 'antd';
import * as actions from '../../redux/actions/action';
import * as columnRules from '../../redux/actions/columnRules';
import EditBox from './EditBox';
import { getNameWidth, getTextById, getActionLabelByType, filterData, getArrBySpliceType } from './config';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import cx from 'classnames';
class ColumnRulesCon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDeleteBox: null,
      dragActive: false,
    };
    this.con = null;
  }

  componentDidMount() {
    if (this.con) {
      this.con.addEventListener('dragstart', () => this.setState({ dragActive: true }));
      this.con.addEventListener('dragend', () => this.setState({ dragActive: false }));
    }
  }

  renderFilterItemTexts = (filters = [], disabled = false) => {
    const { worksheetControls } = this.props;
    let filterItemTexts = getArrBySpliceType(filters).map(item => {
      return item.map(it => {
        const transData = filterData(worksheetControls, [it], true, worksheetControls);
        return transData[0] || {};
      });
    });

    const renderItemText = (item, index) => {
      return (
        <span key={index}>
          {index ? <span className="mLeft10 mRight10 gray_9e Font13">{_l('且')}</span> : null}
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
              {index ? <span className="mLeft10 mRight10">{_l('或')}</span> : null}
              {filterItemTexts.length > 1 ? <span className="gray_9e mRight2">(</span> : null}
              {item.map((child, childIdx) => {
                return renderItemText(child, childIdx);
              })}
              {filterItemTexts.length > 1 ? <span className="gray_9e mLeft2">)</span> : null}
            </span>
          );
        })}
      </React.Fragment>
    );
  };

  renderRuleItemCon = columnRules => {
    const {
      selectColumnRules,
      deleteControlRules,
      copyControlRules,
      updateRuleAttr,
      worksheetControls,
      editingId,
    } = this.props;
    const { showDeleteBox } = this.state;
    const { name, filters = [], ruleItems = [], ruleId, disabled } = columnRules;
    return (
      <div
        ref={con => (this[ruleId] = con)}
        className={cx('ruleItemCon', { active: editingId === ruleId, disabled: disabled })}
        onClick={e => {
          if (
            ($(e.target).closest('.ruleItemOptions')[0] &&
              $(e.target).closest('.ruleItemOptions')[0].className === 'ruleItemOptions') ||
            ($(e.target).closest('.DropdownDeleteRuleTrigger')[0] &&
              $(e.target).closest('.DropdownDeleteRuleTrigger')[0].className === 'DropdownDeleteRuleTrigger') ||
            (e.target && e.target.className.indexOf('ruleNameInput') > -1)
          ) {
            e.preventDefault();
            return;
          }
          selectColumnRules(columnRules);
        }}
      >
        <div
          className="ruleNameInputBox"
          onClick={e => {
            setTimeout(() => {
              this[columnRules.ruleId].focus();
              $(this[columnRules.ruleId]).css('width', `${getNameWidth(name) + 32}px`);
            });
          }}
        >
          <input
            ref={con => (this[columnRules.ruleId] = con)}
            className={cx('ruleNameInput', { Gray_bd: disabled })}
            style={{ width: getNameWidth(name) }}
            defaultValue={name}
            onBlur={e => {
              updateRuleAttr('name', !!e.target.value ? e.target.value : name, columnRules);
            }}
          />
        </div>
        <span className={cx('ruleItemTextRow', { Gray_bd: disabled })}>
          <span className="leftLabel">{_l('当满足条件')}</span>
          <span className="rightLabel">
            {filters.length > 0 ? this.renderFilterItemTexts(filters, disabled) : ''}
            <span className="mLeft20 gray_9e">{_l('时')}</span>
          </span>
        </span>
        {ruleItems.map(actionItem => {
          let text = '';
          if (_.includes([7, 8], actionItem.type)) {
            text = getActionLabelByType(actionItem.type);
          } else if (actionItem.type === 6) {
            text = actionItem.message;
          } else {
            const currentArr = getTextById(worksheetControls, actionItem.controls) || [];
            text = currentArr.map(cur => cur.name).join(', ');
          }
          return (
            <span className="ruleItemTextRow mTop10">
              <span className={cx('leftLabel', { Gray_bd: disabled })}>
                {_.includes([7, 8], actionItem.type) ? '' : getActionLabelByType(actionItem.type)}
              </span>
              <span className={cx('rightLabel', { Gray_bd: disabled })}>{text}</span>
            </span>
          );
        })}

        <div className={cx('ruleItemOptions', { Block: showDeleteBox === ruleId })}>
          <Tooltip
            popupPlacement="bottom"
            getPopupContainer={() => this[ruleId]}
            text={<span>{disabled ? _l('停用') : _l('开启')}</span>}
          >
            <span className="mLeft16">
              <Switch
                checked={!columnRules.disabled}
                onClick={checked => updateRuleAttr('disabled', checked, columnRules)}
              />
            </span>
          </Tooltip>
          <Tooltip popupPlacement="bottom" getPopupContainer={() => this[ruleId]} text={<span>{_l('复制')}</span>}>
            <Icon icon="copy" className="Font16 Hand Gray_9e Hover_49" onClick={() => copyControlRules(columnRules)} />
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
                  <div className="Gray_9e Hand" onClick={() => this.setState({ showDeleteBox: null })}>
                    {_l('取消')}
                  </div>
                  <div
                    className="deleteBtn"
                    onClick={() => {
                      deleteControlRules(columnRules);
                      this.setState({ showDeleteBox: null });
                    }}
                  >
                    {_l('删除')}
                  </div>
                </div>
              </div>
            }
          >
            <Tooltip popupPlacement="bottom" getPopupContainer={() => this[ruleId]} text={<span>{_l('删除')}</span>}>
              <Icon icon="delete1" className="Font16 Red Hand RedHover" />
            </Tooltip>
          </Trigger>
        </div>
      </div>
    );
  };

  renderCon = () => {
    const { columnRulesListData = [], selectRules, editingId = '', grabControlRules } = this.props;
    const columnRulesListDataFilter =
      editingId.indexOf('new_') >= 0 ? columnRulesListData.concat(selectRules) : columnRulesListData;

    if (!columnRulesListDataFilter.length) {
      return (
        <div className="emptyColumnRules">
          <span className="emptyIcon">
            <Icon icon="list" className="Gray_bd" />
          </span>
          <span className="Font15 Gray_9e mTop20">{_l('暂无业务规则')}</span>
        </div>
      );
    }

    const SortableItem = SortableElement(({ columnRules }) => {
      return (
        <div>
          <div
            className={cx('ruleDrabItemContainer', this.state.dragActive ? 'ruleGrabbing' : 'ruleGrab')}
            ref={con => (this.con = con)}
          >
            <div className={cx('grabIcon')}>
              <Icon icon="drag" className="TxtMiddle Font14"></Icon>
            </div>
            {this.renderRuleItemCon(editingId === columnRules.ruleId ? selectRules : columnRules)}
          </div>
        </div>
      );
    });

    const SortableList = SortableContainer(({ list }) => {
      return (
        <div className="flex flexColumn">
          {list.map((item, index) => (
            <SortableItem columnRules={item} key={index} index={index} />
          ))}
        </div>
      );
    });

    return (
      <ScrollView className="rulesCon">
        <SortableList
          list={columnRulesListDataFilter}
          distance={5}
          helperClass="columnRuleSortableList"
          onSortEnd={({ oldIndex, newIndex }) => {
            grabControlRules(arrayMove(columnRulesListData, oldIndex, newIndex));
          }}
        />
      </ScrollView>
    );
  };

  render() {
    const { isEdit, addColumnRules, saveControlRules, clearColumnRules, editingId } = this.props;
    return (
      <div className="columnRulesCon">
        <div className="conBox">
          <div className="topBoxText">
            <div className="textCon">
              <h2>{_l('业务规则')}</h2>
              <p>
                <span className="Font13">
                  {_l('添加业务规则可以规范化表单数据录入。当满足条件时，显示、隐藏、更改字段属性或提示错误。')}
                </span>
                <Support type={3} text={_l('帮助')} href="https://help.mingdao.com/sheet6.html" />
              </p>
            </div>
            <div className="saveRules" onClick={() => addColumnRules()}>
              <Icon icon="plus" className="mRight8" />
              {_l('添加规则')}
            </div>
          </div>
          {this.renderCon()}
        </div>
        <Drawer
          className="columnRulesDrawerContainer"
          width={480}
          title={<span>{editingId.indexOf('new_') >= 0 ? _l('新建规则') : _l('编辑规则')}</span>}
          placement="right"
          onClose={() => clearColumnRules()}
          visible={isEdit}
          maskClosable={false}
          getContainer={false}
          closeIcon={<i className="icon-close Font20" />}
          footer={
            <div className="ruleFooter">
              <Button className="mRight15" size="medium" onClick={() => saveControlRules()}>
                {_l('确定')}
              </Button>
              <Button size="medium" type="secondary" className="closeBtn" onClick={() => clearColumnRules()}>
                {_l('取消')}
              </Button>
            </div>
          }
        >
          <EditBox />
        </Drawer>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  columnRulesListData: state.formSet.columnRulesListData,
  worksheetControls: state.formSet.worksheetRuleControls,
  isEdit: state.formSet.isEdit,
  selectRules: state.formSet.selectRules,
  editingId: state.formSet.editingId,
});
const mapDispatchToProps = dispatch => bindActionCreators({ ...actions, ...columnRules }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ColumnRulesCon);
