import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Icon, Support, Button, ScrollView } from 'ming-ui';
import { Drawer } from 'antd';
import * as actions from '../../redux/actions/action';
import * as columnRules from '../../redux/actions/columnRules';
import EditBox from './EditBox';
import RuleItem from './RuleItem';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import cx from 'classnames';
import _ from 'lodash';

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
    const { columnRulesListData = [], grabControlRules, selectRules = {} } = this.props;
    const renderData =
      (selectRules.ruleId || '').indexOf('new_') >= 0 ? columnRulesListData.concat(selectRules) : columnRulesListData;

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
    const { addColumnRules, saveControlRules, clearColumnRules, selectRules = {} } = this.props;
    const isAdd = (selectRules.ruleId || '').indexOf('new_') >= 0;

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
                <Support type={3} text={_l('帮助')} href="https://help.mingdao.com/sheet6" />
              </p>
            </div>
            <div className="saveRules" onClick={() => addColumnRules()}>
              <Icon icon="plus" className="mRight8" />
              {_l('添加规则')}
            </div>
          </div>
          {this.renderCon()}
        </div>
        {selectRules.ruleId && (
          <Drawer
            className="columnRulesDrawerContainer"
            width={640}
            title={<span>{isAdd ? _l('新建规则') : _l('编辑规则')}</span>}
            placement="right"
            onClose={() => clearColumnRules()}
            visible={true}
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
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  columnRulesListData: state.formSet.columnRulesListData,
  worksheetControls: state.formSet.worksheetRuleControls,
  selectRules: state.formSet.selectRules,
});
const mapDispatchToProps = dispatch => bindActionCreators({ ...actions, ...columnRules }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ColumnRulesCon);
