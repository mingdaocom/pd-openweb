import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Drawer } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Button, Icon, ScrollView, SortableList, Support } from 'ming-ui';
import { hasRuleChanged, TAB_TYPES, TABS_DISPLAY } from './config';
import EditBox from './EditBox';
import * as actions from './redux/actions/columnRules';
import * as columnRules from './redux/actions/columnRules';
import RuleItem from './RuleItem';

class ColumnRulesCon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillUnmount() {
    this.props.updateActiveTab(0);
  }

  renderCon() {
    const { columnRulesListData = [], grabControlRules, selectRules = {}, activeTab, addColumnRules } = this.props;
    const totalData =
      (selectRules.ruleId || '').indexOf('-') >= 0 ? columnRulesListData.concat(selectRules) : columnRulesListData;

    const renderData = totalData.filter(i => i.type === activeTab);

    if (!renderData.length) {
      return (
        <div className="emptyColumnRules">
          <span className="emptyIcon">
            <Icon icon="list" className="Gray_bd" />
          </span>
          <span className="Font15 Gray_9e mTop20">{_l('暂无业务规则')}</span>
          <div className="addEmptyRules" onClick={() => addColumnRules()}>
            <Icon icon="plus" className="mRight3" />
            {_l('添加规则')}
          </div>
        </div>
      );
    }

    return (
      <ScrollView className="rulesCon">
        <SortableList
          items={renderData}
          itemKey="ruleId"
          helperClass="columnRuleSortableList"
          onSortEnd={newItems => grabControlRules(newItems)}
          renderItem={({ item }) => (
            <div className="ruleDrabItemContainer">
              <div className={cx('grabIcon')}>
                <Icon icon="drag" className="TxtMiddle Font14"></Icon>
              </div>
              <RuleItem ruleData={item} />
            </div>
          )}
        />
      </ScrollView>
    );
  }

  render() {
    const {
      addColumnRules,
      saveControlRules,
      clearColumnRules,
      selectRules = {},
      activeTab,
      updateActiveTab,
      columnRulesListData,
    } = this.props;
    const isAdd = (selectRules.ruleId || '').indexOf('-') >= 0;
    const tabText = _.get(
      _.find(TABS_DISPLAY, i => i.value === activeTab),
      'text',
    );

    return (
      <Fragment>
        <div className="columnRuleTitle">
          <div className="flexRow">
            <span className="Font17 Bold flex LineHeight36">{_l('业务规则')}</span>
            {activeTab !== TAB_TYPES.LOCK_RULE && (
              <div className="addRules" onClick={() => addColumnRules()}>
                <Icon icon="plus" className="mRight3" />
                {_l('添加规则')}
              </div>
            )}
          </div>
          <div className="columnRuleTabs">
            {TABS_DISPLAY.map(item => {
              const list = columnRulesListData.filter(i => i.type === item.value);
              return (
                <div
                  className={cx('tabItem', { active: activeTab === item.value })}
                  onClick={() => {
                    if (hasRuleChanged(columnRulesListData, selectRules)) return;
                    selectRules.ruleId && clearColumnRules();
                    updateActiveTab(item.value);
                  }}
                >
                  {item.text}
                  {list.length > 0 && <span className="mLeft3">({list.length})</span>}
                </div>
              );
            })}
          </div>
          <div className="columnRuleDesc">
            <span className="Gray_9e">
              {activeTab === TAB_TYPES.NORMAL_RULE
                ? _l('显示、隐藏、只读、可编辑、必填会随着条件变化实时生效，只读所有将在记录保存后生效。')
                : activeTab === TAB_TYPES.CHECK_RULE
                  ? _l('当满足条件时,可对指定字段进行提示。')
                  : _l(
                      '满足条件时，将在记录保存后生效锁定。锁定记录无法被编辑或删除，仅应用管理员可解锁记录。只能添加一条锁定规则。',
                    )}
            </span>
            <Support type={3} text={_l('帮助')} href="https://help.mingdao.com/worksheet/business-rule" />
          </div>
        </div>

        {this.renderCon()}

        {selectRules.ruleId && (
          <Drawer
            className="columnRulesDrawerContainer"
            width={640}
            title={<span>{isAdd ? _l('新建%0规则', tabText) : _l('编辑%0规则', tabText)}</span>}
            placement="right"
            mask={false}
            onClose={() => clearColumnRules()}
            visible={true}
            getContainer={false}
            closeIcon={<i className="icon-close Font20" />}
            footer={
              <div className="ruleFooter">
                <Button className="mRight15 saveBtn" size="medium" onClick={() => saveControlRules()}>
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
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  columnRulesListData: state.formSet.columnRulesListData,
  selectRules: state.formSet.selectRules,
  activeTab: state.formSet.activeTab,
});
const mapDispatchToProps = dispatch => bindActionCreators({ ...actions, ...columnRules }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ColumnRulesCon);
