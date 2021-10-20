import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { OtherFieldList, SelectOtherField } from '../components';
import { DynamicValueInputWrap } from '../styled';
import DialogSelectGroups from 'src/components/dialogSelectDept';
import update from 'immutability-helper';
import { Dropdown, Menu } from 'antd';
import { DropdownContent } from '../../../../styled';

@connect(({ appPkg }) => ({
  projectId: appPkg.projectId,
}))
export default class DepartmentInput extends Component {
  // 成员多选数据处理
  removeItem = id => {
    const { dynamicValue, onDynamicValueChange } = this.props;
    const getId = item => {
      const { staticValue } = item;
      if (!staticValue) return '';
      return _.get(_.isString(staticValue) ? JSON.parse(staticValue) : staticValue, 'departmentId');
    };
    const index = _.findIndex(dynamicValue, item => {
      return getId(item) === id;
    });
    if (index > -1) {
      onDynamicValueChange(update(dynamicValue, { $splice: [[index, 1]] }));
    }
  };
  handleClick = key => {
    const { globalSheetInfo, onDynamicValueChange } = this.props;
    const { projectId } = globalSheetInfo;
    if (key === 'current') {
      onDynamicValueChange([
        {
          rcid: '',
          cid: '',
          staticValue: JSON.stringify({ departmentName: _l('当前用户所在部门'), departmentId: 'current' }),
          isAsync: true,
        },
      ]);
      return;
    }
    // eslint-disable-next-line no-new
    new DialogSelectGroups({
      projectId,
      isIncludeRoot: false,
      unique: true,
      showCreateBtn: false,
      selectFn: arr => {
        const value = arr.map(({ departmentId, departmentName }) => ({
          cid: '',
          rcid: '',
          staticValue: JSON.stringify({ departmentId, departmentName }),
        }));
        onDynamicValueChange(value);
      },
    });
  };
  render() {
    return (
      <DynamicValueInputWrap>
        <Dropdown
          trigger={['click']}
          overlay={
            <DropdownContent>
              {[
                { key: 'current', text: _l('当前用户所在部门') },
                { key: 'assign', text: _l('指定部门') },
              ].map(({ key, text }) => (
                <div className="item" key={key} onClick={() => this.handleClick(key)}>
                  {text}
                </div>
              ))}
            </DropdownContent>
          }>
          <OtherFieldList {...this.props} removeItem={this.removeItem} />
        </Dropdown>
        <SelectOtherField {...this.props} />
      </DynamicValueInputWrap>
    );
  }
}
