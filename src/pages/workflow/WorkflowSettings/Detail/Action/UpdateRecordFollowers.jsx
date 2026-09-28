import React, { Fragment } from 'react';
import _ from 'lodash';
import { Radio } from 'ming-ui/antd-components';
import { SelectNodeObject, SingleControlValue } from '../components';

const UPDATE_TYPES = [
  {
    value: 1,
    text: _l('添加关注者'),
    describe: _l('将指定用户添加为记录关注者，关注者将在记录更新或新增讨论时收到通知'),
  },
  {
    value: 2,
    text: _l('移除关注者'),
    describe: _l('将指定用户从记录关注者中移除，移除后将不再接收该记录的通知'),
  },
  {
    value: 0,
    text: _l('覆盖关注者'),
    describe: _l('使用指定用户替换当前关注者列表，原有关注者将被移除'),
  },
];

export const getFollowerFields = controls => {
  const control = (controls || [])[0];

  if (!control) return [];

  return [
    {
      addType: 1,
      fieldId: control.controlId,
      type: control.type,
      enumDefault: control.enumDefault,
      fieldValue: _.includes([26, 27, 48], control.type) ? '[]' : '',
      fieldValueId: '',
      fieldValueName: '',
      nodeId: '',
      nodeName: '',
    },
  ];
};

export default class UpdateRecordFollowers extends React.Component {
  updateAddType = addType => {
    const { data, updateSource } = this.props;
    const fields = _.cloneDeep(data.fields || []);

    if (!fields.length) return;

    fields[0].addType = addType;
    updateSource({ fields });
  };

  render() {
    const { data, SelectNodeObjectChange } = this.props;
    const field = (data.fields || [])[0];

    return (
      <Fragment>
        <div className="textSecondary workflowDetailDesc pTop15 pBottom15">
          {_l('通过该节点可更新记录的关注用户，包括添加、移除或覆盖关注者。关注者将在新增讨论时收到系统通知。')}
        </div>

        <div className="Font13 bold mTop20">{_l('选择更新对象')}</div>
        <div className="Font13 textSecondary mTop10">{_l('当前流程中的节点对象')}</div>
        <SelectNodeObject
          appList={data.flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={SelectNodeObjectChange}
        />

        {data.selectNodeId && (
          <Fragment>
            <div className="Font13 bold mTop20">{_l('更新方式')}</div>
            {UPDATE_TYPES.map(item => (
              <div className="mTop20" key={item.value}>
                <Radio
                  className="Bold"
                  checked={field && field.addType === item.value}
                  onChange={() => this.updateAddType(item.value)}
                  title={item.text}
                >
                  {item.text}
                </Radio>
                <div className="textSecondary mLeft26 mTop5">{item.describe}</div>
              </div>
            ))}

            <div className="Font13 bold mTop20">{_l('关注者')}</div>
            {field && (
              <SingleControlValue
                companyId={this.props.companyId}
                relationId={this.props.relationId}
                processId={this.props.processId}
                selectNodeId={this.props.selectNodeId}
                sourceNodeId={data.selectNodeId}
                controls={data.controls}
                formulaMap={data.formulaMap}
                fields={data.fields}
                updateSource={this.props.updateSource}
                item={field}
                i={0}
              />
            )}
          </Fragment>
        )}
      </Fragment>
    );
  }
}
