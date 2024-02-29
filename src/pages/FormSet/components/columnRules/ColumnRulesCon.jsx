import React, { Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Icon, Support, Button, ScrollView } from 'ming-ui';
import { Drawer } from 'antd';
import * as actions from './redux/actions/columnRules';
import * as columnRules from './redux/actions/columnRules';
import EditBox from './EditBox';
import RuleItem from './RuleItem';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { hasRuleChanged } from './config';
import cx from 'classnames';
import _ from 'lodash';

const TABS_DISPLAY = [
  {
    text: _l('交互'),
    value: 0,
  },
  {
    text: _l('验证'),
    value: 1,
  },
];

const SortableItem = SortableElement(({ value }) => {
  return (
    <div>
      <div className="ruleDrabItemContainer">
        <div className={cx('grabIcon')}>
          <Icon icon="drag" className="TxtMiddle Font14"></Icon>
        </div>
        <RuleItem ruleData={value} />
      </div>
    </div>
  );
});

const SortableList = SortableContainer(({ list }) => {
  return (
    <div className="flex flexColumn">
      {list.map((item, index) => (
        <SortableItem value={item} key={index} index={index} sortIndex={index} />
      ))}
    </div>
  );
});
class ColumnRulesCon extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderCon() {
    const { columnRulesListData = [], grabControlRules, selectRules = {}, activeTab } = this.props;
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
        </div>
      );
    }

    return (
      <ScrollView className="rulesCon">
        <SortableList
          list={renderData}
          distance={5}
          helperClass="columnRuleSortableList"
          onSortEnd={({ oldIndex, newIndex }) => {
            grabControlRules(arrayMove(renderData, oldIndex, newIndex));
          }}
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
          <div className="Font17 Bold">{_l('业务规则')}</div>
          <div className="columnRuleTabs">
            {TABS_DISPLAY.map(item => (
              <div
                className="tabItems"
                onClick={() => {
                  if (hasRuleChanged(columnRulesListData, selectRules)) return;
                  selectRules.ruleId && clearColumnRules();
                  updateActiveTab(item.value);
                }}
              >
                <div className={cx('tabItem', { active: activeTab === item.value })}>{item.text}</div>
              </div>
            ))}
          </div>
          <div className="columnRuleDesc">
            <span className="flex">
              <span className="Gray_9e">
                {activeTab === 0
                  ? _l('交互规则可以根据条件实时控制指定字段的显隐、是否可编辑、是否必填等属性。')
                  : _l('验证规则可以规范数据的录入。当满足条件时，禁止保存记录并对指定字段提示错误。')}
              </span>
              <Support type={3} text={_l('帮助')} href="https://help.mingdao.com/sheet6" />
            </span>
            <div className="addRules" onClick={() => addColumnRules()}>
              <Icon icon="plus" className="mRight3" />
              {_l('添加规则')}
            </div>
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
